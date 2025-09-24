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
    municipality_id INT NULL, -- Added municipality_id to link municipality users
    institute_id INT NULL, -- Added institute_id to link institute users
    status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
    phone VARCHAR(20),
    document VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_status (status),
    INDEX idx_municipality (municipality_id),
    INDEX idx_institute (institute_id)
) ENGINE=InnoDB;

-- Tabela de Municípios
CREATE TABLE municipalities (
    id INT AUTO_INCREMENT PRIMARY KEY,
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
    INDEX idx_specialty (specialty),
    INDEX idx_registration (registration_number),
    INDEX idx_status (status),
    INDEX idx_institute (institute_id),
    INDEX idx_user (user_id)
) ENGINE=InnoDB;

-- Tabela de Pacientes
CREATE TABLE patients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    municipality_id INT NOT NULL, -- Made NOT NULL to ensure every patient belongs to a municipality
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
-- DADOS DE EXEMPLO CORRIGIDOS
-- =====================================================

-- Inserir municípios
INSERT INTO municipalities (id, name, code, state, population, mayor, health_secretary, contact_email, contact_phone, address) VALUES
(1, 'São Paulo', 'SP001', 'SP', 12000000, 'Ricardo Nunes', 'Dr. Luiz Carlos Zamarco', 'saude@prefeitura.sp.gov.br', '(11) 3113-0000', 'Viaduto do Chá, 15 - Centro, São Paulo - SP'),
(2, 'Rio de Janeiro', 'RJ001', 'RJ', 6700000, 'Eduardo Paes', 'Dr. Daniel Soranz', 'saude@rio.rj.gov.br', '(21) 2976-1000', 'Rua Afonso Cavalcanti, 455 - Cidade Nova, Rio de Janeiro - RJ'),
(3, 'Belo Horizonte', 'MG001', 'MG', 2500000, 'Alexandre Kalil', 'Dra. Flávia Falci', 'saude@pbh.gov.br', '(31) 3277-5000', 'Av. Afonso Pena, 1212 - Centro, Belo Horizonte - MG');

-- Inserir institutos
INSERT INTO institutes (id, name, code, type, specialties, director, contact_email, contact_phone, address, cnpj, license_number) VALUES
(1, 'Instituto de Cardiologia de São Paulo', 'ICSP001', 'private', '[\"Cardiologia\", \"Cirurgia Cardiovascular\", \"Hemodinâmica\"]', 'Dr. Roberto Kalil', 'contato@institutocardiologia.com.br', '(11) 3069-5000', 'Av. Dr. Dante Pazzanese, 500 - Vila Mariana, São Paulo - SP', '12.345.678/0001-90', 'CNES-123456'),
(2, 'Hospital das Clínicas FMUSP', 'HCFM001', 'public', '[\"Cardiologia\", \"Neurologia\", \"Oncologia\", \"Ortopedia\"]', 'Prof. Dr. Giovanni Cerri', 'diretoria@hc.fm.usp.br', '(11) 2661-0000', 'Av. Dr. Enéas Carvalho de Aguiar, 255 - Cerqueira César, São Paulo - SP', '63.025.530/0001-04', 'CNES-789012'),
(3, 'Instituto Nacional de Traumatologia', 'INTO001', 'public', '[\"Ortopedia\", \"Traumatologia\", \"Fisioterapia\"]', 'Dr. Marcos Pontes', 'diretoria@into.saude.gov.br', '(21) 2134-5000', 'Av. Brasil, 500 - Caju, Rio de Janeiro - RJ', '34.567.890/0001-23', 'CNES-345678');

-- Inserir usuários com proper municipality and institute relationships
INSERT INTO users (id, name, email, password, role, municipality_id, institute_id, phone, document) VALUES
(1, 'Administrador Sistema', 'admin@sistema.gov.br', '$2b$10$hash_password_here', 'admin', NULL, NULL, '(11) 99999-9999', '123.456.789-00'),
(2, 'Secretário Municipal SP', 'secretario.sp@prefeitura.sp.gov.br', '$2b$10$hash_password_here', 'municipality', 1, NULL, '(11) 3333-4444', '111.222.333-44'),
(3, 'Secretário Municipal RJ', 'secretario.rj@rio.rj.gov.br', '$2b$10$hash_password_here', 'municipality', 2, NULL, '(21) 2976-1001', '222.333.444-55'),
(4, 'Secretário Municipal BH', 'secretario.bh@pbh.gov.br', '$2b$10$hash_password_here', 'municipality', 3, NULL, '(31) 3277-5001', '333.444.555-66'),
(5, 'Diretor Instituto Cardiologia', 'diretor@institutocardiologia.com.br', '$2b$10$hash_password_here', 'institute', NULL, 1, '(11) 5555-6666', '444.555.666-77'),
(6, 'Diretor HC FMUSP', 'diretor@hc.fm.usp.br', '$2b$10$hash_password_here', 'institute', NULL, 2, '(11) 2661-0001', '555.666.777-88'),
(7, 'Diretor INTO', 'diretor@into.saude.gov.br', '$2b$10$hash_password_here', 'institute', NULL, 3, '(21) 2134-5001', '666.777.888-99'),
(8, 'Dr. João Silva', 'joao.silva@institutocardiologia.com.br', '$2b$10$hash_password_here', 'professional', NULL, 1, '(11) 7777-8888', '777.888.999-00'),
(9, 'Dra. Maria Santos', 'maria.santos@institutocardiologia.com.br', '$2b$10$hash_password_here', 'professional', NULL, 1, '(11) 9999-0000', '888.999.000-11');

-- Inserir profissionais com correct user relationships
INSERT INTO professionals (user_id, institute_id, name, specialty, registration_number, registration_council, phone, email, document, birth_date, address) VALUES
(8, 1, 'Dr. João Silva', 'Cardiologia', '123456', 'CRM', '(11) 7777-8888', 'joao.silva@institutocardiologia.com.br', '777.888.999-00', '1980-05-15', 'Rua das Flores, 123 - Vila Madalena, São Paulo - SP'),
(9, 1, 'Dra. Maria Santos', 'Cirurgia Cardiovascular', '789012', 'CRM', '(11) 9999-0000', 'maria.santos@institutocardiologia.com.br', '888.999.000-11', '1975-08-22', 'Av. Paulista, 1000 - Bela Vista, São Paulo - SP'),
(NULL, 2, 'Dr. Pedro Oliveira', 'Neurologia', '345678', 'CRM', '(11) 8888-7777', 'pedro.oliveira@hc.fm.usp.br', '999.000.111-22', '1982-12-10', 'Rua Augusta, 500 - Consolação, São Paulo - SP'),
(NULL, 3, 'Dr. Ana Costa', 'Ortopedia', '901234', 'CRM', '(21) 6666-5555', 'ana.costa@into.saude.gov.br', '000.111.222-33', '1978-03-18', 'Rua Copacabana, 200 - Copacabana, Rio de Janeiro - RJ');

-- Inserir pacientes ensuring each belongs to their respective municipality
INSERT INTO patients (municipality_id, name, document, birth_date, gender, phone, email, address, emergency_contact, emergency_phone, blood_type, sus_card) VALUES
(1, 'José da Silva', '123.456.789-01', '1965-04-12', 'M', '(11) 9876-5432', 'jose.silva@email.com', 'Rua A, 123 - Jardim São Paulo, São Paulo - SP', 'Maria da Silva', '(11) 9876-5433', 'O+', '123456789012345'),
(1, 'Ana Souza', '987.654.321-02', '1972-08-25', 'F', '(11) 8765-4321', 'ana.souza@email.com', 'Av. B, 456 - Vila Esperança, São Paulo - SP', 'João Souza', '(11) 8765-4322', 'A-', '234567890123456'),
(1, 'Roberto Lima', '456.123.789-03', '1985-09-10', 'M', '(11) 7654-3210', 'roberto.lima@email.com', 'Rua C, 789 - Mooca, São Paulo - SP', 'Carla Lima', '(11) 7654-3211', 'B+', '345678901234567'),
(2, 'Carlos Santos', '789.123.456-04', '1980-11-30', 'M', '(21) 7654-3210', 'carlos.santos@email.com', 'Rua D, 321 - Tijuca, Rio de Janeiro - RJ', 'Lucia Santos', '(21) 7654-3211', 'B+', '456789012345678'),
(2, 'Fernanda Costa', '321.654.987-05', '1992-03-18', 'F', '(21) 6543-2109', 'fernanda.costa@email.com', 'Av. E, 654 - Copacabana, Rio de Janeiro - RJ', 'Paulo Costa', '(21) 6543-2108', 'AB+', '567890123456789'),
(3, 'Mariana Lima', '654.987.321-06', '1990-02-14', 'F', '(31) 6543-2109', 'mariana.lima@email.com', 'Av. F, 987 - Savassi, Belo Horizonte - MG', 'Ricardo Lima', '(31) 6543-2108', 'AB+', '678901234567890'),
(3, 'Pedro Alves', '987.321.654-07', '1988-07-22', 'M', '(31) 5432-1098', 'pedro.alves@email.com', 'Rua G, 456 - Centro, Belo Horizonte - MG', 'Ana Alves', '(31) 5432-1097', 'O-', '789012345678901');

-- =====================================================
-- ÍNDICES ADICIONAIS PARA PERFORMANCE
-- =====================================================

-- Índices compostos para consultas frequentes
CREATE INDEX idx_requests_municipality_status ON requests(municipality_id, status);
CREATE INDEX idx_requests_institute_status ON requests(institute_id, status);
CREATE INDEX idx_requests_professional_date ON requests(professional_id, requested_date);
CREATE INDEX idx_patients_municipality_document ON patients(municipality_id, document);
CREATE INDEX idx_professionals_institute_specialty ON professionals(institute_id, specialty);

-- =====================================================
-- VIEWS ÚTEIS
-- =====================================================

-- View para relatório de solicitações
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

-- View para estatísticas por município
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
-- TRIGGERS PARA AUDITORIA
-- =====================================================

DELIMITER //

-- Trigger para auditoria de usuários
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

-- Trigger para histórico de status das solicitações
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
-- PROCEDIMENTOS ARMAZENADOS
-- =====================================================

DELIMITER //

-- Procedimento para obter estatísticas do sistema
CREATE PROCEDURE GetSystemStats()
BEGIN
    SELECT 
        'Total Usuários' as metric, COUNT(*) as value FROM users
    UNION ALL
    SELECT 
        'Total Municípios' as metric, COUNT(*) as value FROM municipalities
    UNION ALL
    SELECT 
        'Total Institutos' as metric, COUNT(*) as value FROM institutes
    UNION ALL
    SELECT 
        'Total Profissionais' as metric, COUNT(*) as value FROM professionals
    UNION ALL
    SELECT 
        'Total Pacientes' as metric, COUNT(*) as value FROM patients
    UNION ALL
    SELECT 
        'Total Solicitações' as metric, COUNT(*) as value FROM requests
    UNION ALL
    SELECT 
        'Solicitações Pendentes' as metric, COUNT(*) as value FROM requests WHERE status = 'pending'
    UNION ALL
    SELECT 
        'Solicitações Concluídas' as metric, COUNT(*) as value FROM requests WHERE status = 'completed';
END//

-- Procedimento para limpar logs antigos
CREATE PROCEDURE CleanOldLogs(IN days_to_keep INT)
BEGIN
    DELETE FROM audit_logs WHERE created_at < DATE_SUB(NOW(), INTERVAL days_to_keep DAY);
    DELETE FROM status_history WHERE created_at < DATE_SUB(NOW(), INTERVAL days_to_keep DAY);
END//

DELIMITER ;

-- =====================================================
-- FOREIGN KEY CONSTRAINTS
-- =====================================================

-- Add foreign key constraints after all tables are created
ALTER TABLE users 
ADD CONSTRAINT fk_users_municipality FOREIGN KEY (municipality_id) REFERENCES municipalities(id) ON DELETE SET NULL,
ADD CONSTRAINT fk_users_institute FOREIGN KEY (institute_id) REFERENCES institutes(id) ON DELETE SET NULL;

ALTER TABLE professionals 
ADD CONSTRAINT fk_professionals_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
ADD CONSTRAINT fk_professionals_institute FOREIGN KEY (institute_id) REFERENCES institutes(id) ON DELETE CASCADE;

ALTER TABLE patients 
ADD CONSTRAINT fk_patients_municipality FOREIGN KEY (municipality_id) REFERENCES municipalities(id) ON DELETE CASCADE;

ALTER TABLE requests 
ADD CONSTRAINT fk_requests_municipality FOREIGN KEY (municipality_id) REFERENCES municipalities(id) ON DELETE CASCADE,
ADD CONSTRAINT fk_requests_institute FOREIGN KEY (institute_id) REFERENCES institutes(id) ON DELETE SET NULL,
ADD CONSTRAINT fk_requests_patient FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
ADD CONSTRAINT fk_requests_professional FOREIGN KEY (professional_id) REFERENCES professionals(id) ON DELETE SET NULL;

-- =====================================================
-- VERIFICAÇÃO DE INTEGRIDADE DOS DADOS
-- =====================================================

-- Verificar se cada município tem um usuário correspondente
SELECT 
    m.id as municipality_id,
    m.name as municipality_name,
    u.id as user_id,
    u.name as user_name,
    u.email as user_email
FROM municipalities m
LEFT JOIN users u ON m.id = u.municipality_id AND u.role = 'municipality'
ORDER BY m.id;

-- Verificar se cada paciente está relacionado ao seu município
SELECT 
    p.id as patient_id,
    p.name as patient_name,
    p.municipality_id,
    m.name as municipality_name,
    m.state
FROM patients p
JOIN municipalities m ON p.municipality_id = m.id
ORDER BY p.municipality_id, p.name;

-- Verificar estatísticas por município
SELECT 
    m.name as municipality,
    COUNT(u.id) as users_count,
    COUNT(p.id) as patients_count,
    COUNT(r.id) as requests_count
FROM municipalities m
LEFT JOIN users u ON m.id = u.municipality_id
LEFT JOIN patients p ON m.id = p.municipality_id
LEFT JOIN requests r ON m.id = r.municipality_id
GROUP BY m.id, m.name
ORDER BY m.name;

-- =====================================================
-- COMENTÁRIOS FINAIS
-- =====================================================

-- Este banco de dados está pronto para uso em produção
-- Lembre-se de:
-- 1. Alterar as senhas padrão dos usuários
-- 2. Configurar backups regulares
-- 3. Monitorar o desempenho das consultas
-- 4. Implementar rotinas de limpeza de logs antigos
-- 5. Configurar SSL/TLS para conexões seguras

SELECT 'Banco de dados criado com sucesso! Verificações de integridade executadas.' as status;
