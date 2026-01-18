CREATE TABLE IF NOT EXISTS t_p46999712_elite_renovation_nsk.users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS t_p46999712_elite_renovation_nsk.requests (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    area DECIMAL(10, 2),
    finish_type VARCHAR(50),
    estimated_price DECIMAL(15, 2),
    message TEXT,
    status VARCHAR(50) DEFAULT 'new',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS t_p46999712_elite_renovation_nsk.portfolio_items (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    image_url VARCHAR(500),
    area DECIMAL(10, 2),
    finish_type VARCHAR(50),
    price DECIMAL(15, 2),
    details TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_requests_user_id ON t_p46999712_elite_renovation_nsk.requests(user_id);
CREATE INDEX IF NOT EXISTS idx_requests_status ON t_p46999712_elite_renovation_nsk.requests(status);
CREATE INDEX IF NOT EXISTS idx_requests_created_at ON t_p46999712_elite_renovation_nsk.requests(created_at DESC);