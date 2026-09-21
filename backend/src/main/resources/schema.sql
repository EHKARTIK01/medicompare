-- MediCompare — reference schema (documentation only).
-- In normal operation Hibernate (spring.jpa.hibernate.ddl-auto=update) creates and
-- evolves these tables automatically from the JPA entities. This file is kept as a
-- readable reference of the resulting structure and is NOT executed by default
-- (spring.sql.init.mode=never). Set it to 'always' only against a throwaway schema.

CREATE TABLE IF NOT EXISTS users (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    full_name       VARCHAR(120) NOT NULL,
    email           VARCHAR(150) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    phone           VARCHAR(20),
    role            VARCHAR(20) NOT NULL DEFAULT 'ROLE_USER',
    enabled         BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      DATETIME,
    updated_at      DATETIME
);

CREATE TABLE IF NOT EXISTS hospitals (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(180) NOT NULL,
    address         VARCHAR(255) NOT NULL,
    city            VARCHAR(80) NOT NULL,
    locality        VARCHAR(80),
    latitude        DOUBLE NOT NULL,
    longitude       DOUBLE NOT NULL,
    rating          DOUBLE DEFAULT 0,
    review_count    INT DEFAULT 0,
    phone           VARCHAR(20),
    email           VARCHAR(150),
    description     VARCHAR(2000),
    facilities      VARCHAR(500),
    specialties     VARCHAR(500),
    opening_hours   VARCHAR(120),
    available       BOOLEAN DEFAULT TRUE,
    verified        BOOLEAN DEFAULT FALSE,
    created_at      DATETIME,
    updated_at      DATETIME
);

CREATE TABLE IF NOT EXISTS medical_services (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(150) NOT NULL UNIQUE,
    category        VARCHAR(80) NOT NULL,
    description     VARCHAR(1000)
);

CREATE TABLE IF NOT EXISTS hospital_services (
    id                  BIGINT AUTO_INCREMENT PRIMARY KEY,
    hospital_id         BIGINT NOT NULL,
    medical_service_id  BIGINT NOT NULL,
    price               DECIMAL(10,2) NOT NULL,
    available           BOOLEAN DEFAULT TRUE,
    updated_at          DATETIME,
    UNIQUE KEY uq_hospital_service (hospital_id, medical_service_id),
    FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE CASCADE,
    FOREIGN KEY (medical_service_id) REFERENCES medical_services(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS doctors (
    id                  BIGINT AUTO_INCREMENT PRIMARY KEY,
    hospital_id         BIGINT NOT NULL,
    name                VARCHAR(150) NOT NULL,
    specialization      VARCHAR(100) NOT NULL,
    qualification       VARCHAR(50),
    experience_years    INT DEFAULT 0,
    rating              DOUBLE DEFAULT 0,
    FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS appointment_slots (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    doctor_id       BIGINT NOT NULL,
    hospital_id     BIGINT NOT NULL,
    slot_date       DATE NOT NULL,
    slot_time       TIME NOT NULL,
    booked          BOOLEAN DEFAULT FALSE,
    UNIQUE KEY uq_doctor_slot (doctor_id, slot_date, slot_time),
    FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
    FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS appointments (
    id                  BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id             BIGINT NOT NULL,
    hospital_id         BIGINT NOT NULL,
    medical_service_id  BIGINT NOT NULL,
    doctor_id           BIGINT,
    slot_id             BIGINT UNIQUE,
    patient_name        VARCHAR(120) NOT NULL,
    patient_phone       VARCHAR(20) NOT NULL,
    patient_age         VARCHAR(10),
    notes               VARCHAR(500),
    status              VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    created_at          DATETIME,
    updated_at          DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (hospital_id) REFERENCES hospitals(id),
    FOREIGN KEY (medical_service_id) REFERENCES medical_services(id),
    FOREIGN KEY (doctor_id) REFERENCES doctors(id),
    FOREIGN KEY (slot_id) REFERENCES appointment_slots(id)
);

CREATE TABLE IF NOT EXISTS payments (
    id                      BIGINT AUTO_INCREMENT PRIMARY KEY,
    appointment_id          BIGINT NOT NULL UNIQUE,
    razorpay_order_id       VARCHAR(100) NOT NULL,
    razorpay_payment_id     VARCHAR(100),
    razorpay_signature      VARCHAR(100),
    amount                  DECIMAL(10,2) NOT NULL,
    currency                VARCHAR(10) DEFAULT 'INR',
    status                  VARCHAR(20) NOT NULL DEFAULT 'CREATED',
    mock                    BOOLEAN DEFAULT TRUE,
    created_at              DATETIME,
    updated_at              DATETIME,
    FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS reviews (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    hospital_id     BIGINT NOT NULL,
    user_id         BIGINT NOT NULL,
    rating          INT NOT NULL,
    comment         VARCHAR(1000),
    approved        BOOLEAN DEFAULT TRUE,
    created_at      DATETIME,
    FOREIGN KEY (hospital_id) REFERENCES hospitals(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS invoices (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    payment_id      BIGINT NOT NULL UNIQUE,
    invoice_number  VARCHAR(40) NOT NULL UNIQUE,
    total_amount    DECIMAL(10,2) NOT NULL,
    issued_at       DATETIME,
    FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE CASCADE
);
