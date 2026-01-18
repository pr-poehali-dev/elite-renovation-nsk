import json
import os
import psycopg2
import hashlib
import secrets
from datetime import datetime, timedelta

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def generate_token() -> str:
    return secrets.token_urlsafe(32)

def handler(event: dict, context) -> dict:
    '''API для регистрации и авторизации пользователей'''
    
    method = event.get('httpMethod', 'POST')
    path = event.get('queryStringParameters', {}).get('action', '')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    db_url = os.environ.get('DATABASE_URL')
    schema = os.environ.get('MAIN_DB_SCHEMA', 'public')
    
    try:
        if path == 'register' and method == 'POST':
            body = json.loads(event.get('body', '{}'))
            
            email = body.get('email', '').strip()
            password = body.get('password', '').strip()
            full_name = body.get('fullName', '').strip()
            phone = body.get('phone', '').strip()
            
            if not all([email, password, full_name]):
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Заполните все обязательные поля'}),
                    'isBase64Encoded': False
                }
            
            conn = psycopg2.connect(db_url)
            cur = conn.cursor()
            
            cur.execute(f"SELECT id FROM {schema}.users WHERE email = %s", (email,))
            if cur.fetchone():
                cur.close()
                conn.close()
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Email уже зарегистрирован'}),
                    'isBase64Encoded': False
                }
            
            password_hash = hash_password(password)
            
            cur.execute(
                f"""
                INSERT INTO {schema}.users (email, password_hash, full_name, phone, created_at, updated_at)
                VALUES (%s, %s, %s, %s, %s, %s)
                RETURNING id, email, full_name, phone
                """,
                (email, password_hash, full_name, phone, datetime.now(), datetime.now())
            )
            
            user = cur.fetchone()
            conn.commit()
            cur.close()
            conn.close()
            
            token = generate_token()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'success': True,
                    'user': {
                        'id': user[0],
                        'email': user[1],
                        'fullName': user[2],
                        'phone': user[3]
                    },
                    'token': token
                }),
                'isBase64Encoded': False
            }
        
        elif path == 'login' and method == 'POST':
            body = json.loads(event.get('body', '{}'))
            
            email = body.get('email', '').strip()
            password = body.get('password', '').strip()
            
            if not all([email, password]):
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Заполните все поля'}),
                    'isBase64Encoded': False
                }
            
            conn = psycopg2.connect(db_url)
            cur = conn.cursor()
            
            password_hash = hash_password(password)
            
            cur.execute(
                f"SELECT id, email, full_name, phone FROM {schema}.users WHERE email = %s AND password_hash = %s",
                (email, password_hash)
            )
            
            user = cur.fetchone()
            cur.close()
            conn.close()
            
            if not user:
                return {
                    'statusCode': 401,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Неверный email или пароль'}),
                    'isBase64Encoded': False
                }
            
            token = generate_token()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'success': True,
                    'user': {
                        'id': user[0],
                        'email': user[1],
                        'fullName': user[2],
                        'phone': user[3]
                    },
                    'token': token
                }),
                'isBase64Encoded': False
            }
        
        else:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Неверный путь или метод'}),
                'isBase64Encoded': False
            }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': f'Ошибка сервера: {str(e)}'}),
            'isBase64Encoded': False
        }
