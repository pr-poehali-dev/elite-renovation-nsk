import json
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import psycopg2
from datetime import datetime

def handler(event: dict, context) -> dict:
    '''API для отправки заявки на ремонт с сайта'''
    
    method = event.get('httpMethod', 'POST')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    try:
        body = json.loads(event.get('body', '{}'))
        
        full_name = body.get('fullName', '').strip()
        email = body.get('email', '').strip()
        phone = body.get('phone', '').strip()
        area = body.get('area')
        finish_type = body.get('finishType', '')
        estimated_price = body.get('estimatedPrice')
        message = body.get('message', '').strip()
        
        if not all([full_name, email, phone]):
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Заполните все обязательные поля'}),
                'isBase64Encoded': False
            }
        
        db_url = os.environ.get('DATABASE_URL')
        schema = os.environ.get('MAIN_DB_SCHEMA', 'public')
        
        conn = psycopg2.connect(db_url)
        cur = conn.cursor()
        
        cur.execute(
            f"""
            INSERT INTO {schema}.requests 
            (full_name, email, phone, area, finish_type, estimated_price, message, status, created_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id
            """,
            (full_name, email, phone, area, finish_type, estimated_price, message, 'new', datetime.now())
        )
        
        request_id = cur.fetchone()[0]
        conn.commit()
        cur.close()
        conn.close()
        
        smtp_host = os.environ.get('SMTP_HOST')
        smtp_port = int(os.environ.get('SMTP_PORT', '587'))
        smtp_user = os.environ.get('SMTP_USER')
        smtp_password = os.environ.get('SMTP_PASSWORD')
        admin_email = os.environ.get('ADMIN_EMAIL')
        
        if all([smtp_host, smtp_user, smtp_password, admin_email]):
            try:
                msg = MIMEMultipart('alternative')
                msg['Subject'] = f'Новая заявка #{request_id} с сайта Elite Renovation'
                msg['From'] = smtp_user
                msg['To'] = admin_email
                
                text = f"""
Новая заявка на ремонт квартиры

Номер заявки: #{request_id}
ФИО: {full_name}
Email: {email}
Телефон: {phone}
Площадь: {area} м²
Тип отделки: {finish_type}
Предварительная стоимость: {estimated_price:,.0f} ₽
Сообщение: {message if message else 'Не указано'}

Дата: {datetime.now().strftime('%d.%m.%Y %H:%M')}
                """
                
                html = f"""
<html>
<body style="font-family: Arial, sans-serif; color: #333;">
    <h2 style="color: #D4AF37;">Новая заявка на ремонт квартиры</h2>
    <table style="border-collapse: collapse; width: 100%; max-width: 600px;">
        <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Номер заявки:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">#{request_id}</td></tr>
        <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>ФИО:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">{full_name}</td></tr>
        <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Email:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">{email}</td></tr>
        <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Телефон:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">{phone}</td></tr>
        <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Площадь:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">{area} м²</td></tr>
        <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Тип отделки:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">{finish_type}</td></tr>
        <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Предв. стоимость:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">{estimated_price:,.0f} ₽</td></tr>
        <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Сообщение:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">{message if message else 'Не указано'}</td></tr>
        <tr><td style="padding: 8px;"><strong>Дата:</strong></td><td style="padding: 8px;">{datetime.now().strftime('%d.%m.%Y %H:%M')}</td></tr>
    </table>
</body>
</html>
                """
                
                part1 = MIMEText(text, 'plain', 'utf-8')
                part2 = MIMEText(html, 'html', 'utf-8')
                msg.attach(part1)
                msg.attach(part2)
                
                with smtplib.SMTP(smtp_host, smtp_port) as server:
                    server.starttls()
                    server.login(smtp_user, smtp_password)
                    server.send_message(msg)
                    
            except Exception as email_error:
                print(f'Email send error: {email_error}')
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'success': True,
                'requestId': request_id,
                'message': 'Заявка успешно отправлена'
            }),
            'isBase64Encoded': False
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': f'Ошибка сервера: {str(e)}'}),
            'isBase64Encoded': False
        }
