
CREATE TABLE Commande (
    planteID varchar  NOT NULL ,
    date_heure datetime  NOT NULL ,
    periode int  NOT NULL ,
    commande text  NOT NULL ,
	executed bit NOT NULL ,
    PRIMARY KEY (
        planteID,date_heure,periode
    )
);

CREATE TABLE Mode (
    planteID varchar  NOT NULL ,
	arrosage bit NOT NULL,
    automatique bit  NOT NULL ,
    PRIMARY KEY (
        planteID,arrosage
    )
);

CREATE TABLE Plante (
    planteID varchar  NOT NULL ,
    raspyID text  NOT NULL ,
    PRIMARY KEY (
        planteID
    )
);

ALTER TABLE Commande ADD CONSTRAINT fk_Commande_planteID FOREIGN KEY(planteID)
REFERENCES Plante (planteID);

ALTER TABLE Mode ADD CONSTRAINT fk_Mode_planteID FOREIGN KEY(planteID)
REFERENCES Plante (planteID);

