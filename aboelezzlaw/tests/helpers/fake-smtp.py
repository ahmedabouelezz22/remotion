"""مصيدة SMTP بسيطة للاختبار: تكتب كل رسالة سطراً في JSONL."""
import asyncio, email, json, os, sys
from email.header import decode_header

MAILBOX = os.environ.get('MAILBOX', '/tmp/mailbox.jsonl')

def dec(value):
    if not value:
        return ''
    return ''.join(
        p.decode(e or 'utf-8', 'replace') if isinstance(p, bytes) else p
        for p, e in decode_header(value)
    )

def body_text(msg):
    if msg.is_multipart():
        for want in ('text/plain', 'text/html'):
            for part in msg.walk():
                if part.get_content_type() == want:
                    raw = part.get_payload(decode=True) or b''
                    return raw.decode(part.get_content_charset() or 'utf-8', 'replace')
        return ''
    raw = msg.get_payload(decode=True) or b''
    return raw.decode(msg.get_content_charset() or 'utf-8', 'replace')

async def handle(reader, writer):
    async def send(line):
        writer.write((line + '\r\n').encode())
        await writer.drain()

    await send('220 localhost test sink')
    sender, rcpts = '', []
    try:
        while True:
            line = await reader.readline()
            if not line:
                break
            cmd = line.decode('utf-8', 'replace').strip()
            upper = cmd.upper()
            if upper.startswith('EHLO') or upper.startswith('HELO'):
                await send('250-localhost')
                await send('250 8BITMIME')
            elif upper.startswith('MAIL FROM'):
                sender = cmd.split('<')[-1].split('>')[0]
                await send('250 OK')
            elif upper.startswith('RCPT TO'):
                rcpts.append(cmd.split('<')[-1].split('>')[0])
                await send('250 OK')
            elif upper == 'DATA':
                await send('354 End data with <CR><LF>.<CR><LF>')
                chunks = []
                while True:
                    data = await reader.readline()
                    if not data or data in (b'.\r\n', b'.\n'):
                        break
                    if data.startswith(b'..'):
                        data = data[1:]
                    chunks.append(data)
                msg = email.message_from_bytes(b''.join(chunks))
                with open(MAILBOX, 'a', encoding='utf-8') as fh:
                    fh.write(json.dumps({
                        'to': rcpts, 'from': sender,
                        'subject': dec(msg.get('Subject')),
                        'text': body_text(msg),
                    }, ensure_ascii=False) + '\n')
                rcpts = []
                await send('250 Queued')
            elif upper == 'RSET':
                sender, rcpts = '', []
                await send('250 OK')
            elif upper == 'QUIT':
                await send('221 Bye')
                break
            elif upper == 'NOOP':
                await send('250 OK')
            else:
                await send('250 OK')
    finally:
        writer.close()

async def main(port):
    server = await asyncio.start_server(handle, '127.0.0.1', port)
    print('sink up on', port, flush=True)
    async with server:
        await server.serve_forever()

if __name__ == '__main__':
    asyncio.run(main(int(sys.argv[1]) if len(sys.argv) > 1 else 1025))
