
CREATE TABLE Commande (
    planteID int  NOT NULL ,
    date_heure datetime  NOT NULL ,
    periode int  NOT NULL ,
    commande text  NOT NULL ,
    PRIMARY KEY (
        planteID,date_heure,periode
    )
);

CREATE TABLE Mode (
    planteID int  NOT NULL ,
    automatique bit  NOT NULL ,
    PRIMARY KEY (
        planteID
    )
);

CREATE TABLE Plante (
    planteID int  NOT NULL ,
    raspyID text  NOT NULL ,
    PRIMARY KEY (
        planteID
    )
);

ALTER TABLE Commande ADD CONSTRAINT fk_Commande_planteID FOREIGN KEY(planteID)
REFERENCES Plante (planteID);

ALTER TABLE Mode ADD CONSTRAINT fk_Mode_planteID FOREIGN KEY(planteID)
REFERENCES Plante (planteID);

