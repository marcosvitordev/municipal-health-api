-- =====================================================
-- SISTEMA DE GESTÃO DE SAÚDE MUNICIPAL
-- Banco de Dados Completo para MySQL
-- =====================================================

-- Criar banco de dados
CREATE DATABASE IF NOT EXISTS sistema_saude_municipal 
CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE sistema_saude_municipal;

-- =====================================================
-- TABELAS PRINCIPAIS
-- =====================================================

-- Tabela de Usuários
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'municipality', 'institute', 'professional') NOT NULL,
    status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
    phone VARCHAR(20),
    document VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_status (status)
) ENGINE=InnoDB;

-- Tabela de Municípios (cada município vinculado a 1 usuário)
CREATE TABLE municipalities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNIQUE, -- cada município tem 1 usuário responsável
    name VARCHAR(255) NOT NULL,
    code VARCHAR(10) UNIQUE NOT NULL,
    state VARCHAR(2) NOT NULL,
    population INT,
    mayor VARCHAR(255),
    health_secretary VARCHAR(255),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(20),
    address TEXT,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_code (code),
    INDEX idx_state (state),
    INDEX idx_status (status)
) ENGINE=InnoDB;

-- Tabela de Institutos
CREATE TABLE institutes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(10) UNIQUE NOT NULL,
    type ENUM('public', 'private', 'mixed') NOT NULL,
    specialties JSON,
    director VARCHAR(255),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(20),
    address TEXT,
    cnpj VARCHAR(18),
    license_number VARCHAR(50),
    status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_code (code),
    INDEX idx_type (type),
    INDEX idx_status (status)
) ENGINE=InnoDB;

-- Tabela de Profissionais
CREATE TABLE professionals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    institute_id INT,
    name VARCHAR(255) NOT NULL,
    specialty VARCHAR(255) NOT NULL,
    registration_number VARCHAR(50) NOT NULL,
    registration_council ENUM('CRM', 'CRO', 'CRF', 'CREFITO', 'CRN', 'CRP', 'COREN') NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(255),
    document VARCHAR(20),
    birth_date DATE,
    address TEXT,
    status ENUM('active', 'inactive', 'vacation', 'suspended') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (institute_id) REFERENCES institutes(id) ON DELETE CASCADE,
    INDEX idx_specialty (specialty),
    INDEX idx_registration (registration_number),
    INDEX idx_status (status),
    INDEX idx_institute (institute_id)
) ENGINE=InnoDB;

-- Tabela de Pacientes (cada paciente pertence a um município)
CREATE TABLE patients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    municipality_id INT,
    name VARCHAR(255) NOT NULL,
    document VARCHAR(20) NOT NULL,
    birth_date DATE NOT NULL,
    gender ENUM('M', 'F', 'Other') NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(255),
    address TEXT,
    emergency_contact VARCHAR(255),
    emergency_phone VARCHAR(20),
    blood_type VARCHAR(5),
    allergies TEXT,
    medical_history TEXT,
    sus_card VARCHAR(20),
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (municipality_id) REFERENCES municipalities(id) ON DELETE CASCADE,
    INDEX idx_document (document),
    INDEX idx_municipality (municipality_id),
    INDEX idx_sus_card (sus_card)
) ENGINE=InnoDB;

-- Tabela de Solicitações
CREATE TABLE requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    municipality_id INT NOT NULL,
    institute_id INT,
    patient_id INT NOT NULL,
    professional_id INT,
    request_number VARCHAR(50) UNIQUE NOT NULL,
    service_type ENUM('consultation', 'exam', 'surgery', 'treatment', 'emergency') NOT NULL,
    specialty VARCHAR(255) NOT NULL,
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    description TEXT NOT NULL,
    clinical_data TEXT,
    requested_date DATE NOT NULL,
    scheduled_date DATETIME,
    completed_date DATETIME,
    status ENUM('pending', 'assigned', 'scheduled', 'in_progress', 'completed', 'cancelled', 'rejected') DEFAULT 'pending',
    rejection_reason TEXT,
    notes TEXT,
    cost DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (municipality_id) REFERENCES municipalities(id) ON DELETE CASCADE,
    FOREIGN KEY (institute_id) REFERENCES institutes(id) ON DELETE SET NULL,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (professional_id) REFERENCES professionals(id) ON DELETE SET NULL,
    INDEX idx_request_number (request_number),
    INDEX idx_status (status),
    INDEX idx_priority (priority),
    INDEX idx_service_type (service_type),
    INDEX idx_requested_date (requested_date),
    INDEX idx_municipality (municipality_id),
    INDEX idx_institute (institute_id)
) ENGINE=InnoDB;

-- Tabela de Documentos
CREATE TABLE documents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    request_id INT NOT NULL,
    type ENUM('medical_report', 'exam_result', 'prescription', 'photo', 'x_ray', 'other') NOT NULL,
    name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INT,
    mime_type VARCHAR(100),
    uploaded_by INT,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (request_id) REFERENCES requests(id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_request (request_id),
    INDEX idx_type (type)
) ENGINE=InnoDB;

-- Tabela de Histórico de Status
CREATE TABLE status_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    request_id INT NOT NULL,
    old_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
    changed_by INT,
    reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (request_id) REFERENCES requests(id) ON DELETE CASCADE,
    FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_request (request_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB;

-- Tabela de Auditoria
CREATE TABLE audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(100) NOT NULL,
    record_id INT,
    old_values JSON,
    new_values JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user (user_id),
    INDEX idx_action (action),
    INDEX idx_table (table_name),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB;

-- Tabela de Configurações do Sistema
CREATE TABLE system_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    description TEXT,
    category VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_key (setting_key),
    INDEX idx_category (category)
) ENGINE=InnoDB;

-- Tabela de Notificações
CREATE TABLE notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('info', 'success', 'warning', 'error') DEFAULT 'info',
    read_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_read (read_at),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB;

-- =====================================================
-- VIEWS
-- =====================================================

CREATE VIEW view_requests_summary AS
SELECT 
    r.id,
    r.request_number,
    m.name as municipality_name,
    i.name as institute_name,
    p.name as patient_name,
    pr.name as professional_name,
    r.service_type,
    r.specialty,
    r.priority,
    r.status,
    r.requested_date,
    r.scheduled_date,
    r.completed_date
FROM requests r
LEFT JOIN municipalities m ON r.municipality_id = m.id
LEFT JOIN institutes i ON r.institute_id = i.id
LEFT JOIN patients p ON r.patient_id = p.id
LEFT JOIN professionals pr ON r.professional_id = pr.id;

CREATE VIEW view_municipality_stats AS
SELECT 
    m.id,
    m.name,
    COUNT(r.id) as total_requests,
    COUNT(CASE WHEN r.status = 'pending' THEN 1 END) as pending_requests,
    COUNT(CASE WHEN r.status = 'completed' THEN 1 END) as completed_requests,
    COUNT(CASE WHEN r.priority = 'urgent' THEN 1 END) as urgent_requests
FROM municipalities m
LEFT JOIN requests r ON m.id = r.municipality_id
GROUP BY m.id, m.name;

-- =====================================================
-- TRIGGERS
-- =====================================================

DELIMITER //

CREATE TRIGGER tr_users_audit_insert
AFTER INSERT ON users
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs (user_id, action, table_name, record_id, new_values)
    VALUES (NEW.id, 'INSERT', 'users', NEW.id, JSON_OBJECT(
        'name', NEW.name,
        'email', NEW.email,
        'role', NEW.role,
        'status', NEW.status
    ));
END//

CREATE TRIGGER tr_users_audit_update
AFTER UPDATE ON users
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs (user_id, action, table_name, record_id, old_values, new_values)
    VALUES (NEW.id, 'UPDATE', 'users', NEW.id, 
        JSON_OBJECT(
            'name', OLD.name,
            'email', OLD.email,
            'role', OLD.role,
            'status', OLD.status
        ),
        JSON_OBJECT(
            'name', NEW.name,
            'email', NEW.email,
            'role', NEW.role,
            'status', NEW.status
        )
    );
END//

CREATE TRIGGER tr_requests_status_history
AFTER UPDATE ON requests
FOR EACH ROW
BEGIN
    IF OLD.status != NEW.status THEN
        INSERT INTO status_history (request_id, old_status, new_status, reason)
        VALUES (NEW.id, OLD.status, NEW.status, 'Status alterado automaticamente');
    END IF;
END//

DELIMITER ;

-- =====================================================
-- PROCEDURES
-- =====================================================

DELIMITER //

CREATE PROCEDURE GetSystemStats()
BEGIN
    SELECT 'Total Usuários' as metric, COUNT(*) as value FROM users
    UNION ALL SELECT 'Total Municípios', COUNT(*) FROM municipalities
    UNION ALL SELECT 'Total Institutos', COUNT(*) FROM institutes
    UNION ALL SELECT 'Total Profissionais', COUNT(*) FROM professionals
    UNION ALL SELECT 'Total Pacientes', COUNT(*) FROM patients
    UNION ALL SELECT 'Total Solicitações', COUNT(*) FROM requests
    UNION ALL SELECT 'Solicitações Pendentes', COUNT(*) FROM requests WHERE status = 'pending'
    UNION ALL SELECT 'Solicitações Concluídas', COUNT(*) FROM requests WHERE status = 'completed';
END//

CREATE PROCEDURE CleanOldLogs(IN days_to_keep INT)
BEGIN
    DELETE FROM audit_logs WHERE created_at < DATE_SUB(NOW(), INTERVAL days_to_keep DAY);
    DELETE FROM status_history WHERE created_at < DATE_SUB(NOW(), INTERVAL days_to_keep DAY);
END//

DELIMITER ;

-- =====================================================
-- COMENTÁRIO
-- =====================================================
SELECT 'Banco de dados criado com sucesso!' as status;
