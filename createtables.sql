CREATE TABLE users (
  id int NOT NULL AUTO_INCREMENT,
  login varchar(30) NOT NULL,
  pass_hash varchar(255) NOT NULL,
  date timestamp DEFAULT CURRENT_TIMESTAMP,
  avatar_url varchar(500),
  PRIMARY KEY (id),
  UNIQUE (login)
);

CREATE TABLE comments (
  id int NOT NULL AUTO_INCREMENT,
	id_sender int NOT NULL,
	id_receiver int NOT NULL,
	text text NOT NULL,
	date timestamp DEFAULT CURRENT_TIMESTAMP,
  seen boolean DEFAULT 0,
	PRIMARY KEY (id),
	FOREIGN KEY (id_sender) REFERENCES users(id),
	FOREIGN KEY (id_receiver) REFERENCES users(id)
);

CREATE TABLE contacts (
	id_owner int NOT NULL,
	id_user int NOT NULL,
	date timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT pk_contact PRIMARY KEY (id_owner, id_user),
	FOREIGN KEY (id_owner) REFERENCES users(id),
	FOREIGN KEY (id_user) REFERENCES users(id)
);

CREATE TABLE last_login_details (
  id_user int NOT NULL,
  date timestamp DEFAULT CURRENT_TIMESTAMP,
  status varchar(15) NOT NULL,
  PRIMARY KEY (id_user),
  FOREIGN KEY (id_user) REFERENCES users(id)
);