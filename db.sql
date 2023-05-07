CREATE TABLE customer(
    id int NOT NULL PRIMARY KEY AUTO_INCREMENT,
    first_name VARCHAR(255),
    last_name VARCHAR(255)
);

INSERT INTO customer (first_name, last_name) VALUES ('Matti', 'Meikäläinen'),('John', 'Doe'),('Lisa', 'Simpson');

