-- MySQL Script generated by MySQL Workbench
-- Fri Mar 11 14:14:09 2022
-- Model: New Model    Version: 1.0
-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema Baza
-- -----------------------------------------------------
DROP SCHEMA IF EXISTS `Baza` ;

-- -----------------------------------------------------
-- Schema Baza
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `Baza` DEFAULT CHARACTER SET utf8 ;
USE `Baza` ;

-- -----------------------------------------------------
-- Table `Baza`.`Korisnik`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `Baza`.`Korisnik` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `KorisnickoIme` VARCHAR(256) NOT NULL,
  `Ime` VARCHAR(256) NOT NULL,
  `Sifra` VARCHAR(256) NOT NULL,
  `email` VARCHAR(256) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `KorisnickoIme_UNIQUE` (`KorisnickoIme` ASC) VISIBLE,
  UNIQUE INDEX `email_UNIQUE` (`email` ASC) VISIBLE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `Baza`.`Eksperiment`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `Baza`.`Eksperiment` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `Naziv` VARCHAR(256) NULL,
  `vlasnik` INT UNSIGNED NOT NULL,
  `csv` VARCHAR(256) NULL,
  PRIMARY KEY (`id`),
  INDEX `vlasnik_idx` (`vlasnik` ASC) VISIBLE,
  CONSTRAINT `vlasnik`
    FOREIGN KEY (`vlasnik`)
    REFERENCES `Baza`.`Korisnik` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `Baza`.`model`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `Baza`.`model` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `naziv` VARCHAR(256) NULL,
  `idEksperimenta` INT UNSIGNED NOT NULL,
  `napravljen` DATETIME NOT NULL,
  `obnovljen` DATETIME NULL,
  PRIMARY KEY (`id`),
  INDEX `eksperiment_idx` (`idEksperimenta` ASC) VISIBLE,
  CONSTRAINT `eksperiment`
    FOREIGN KEY (`idEksperimenta`)
    REFERENCES `Baza`.`Eksperiment` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `Baza`.`Podesavanja`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `Baza`.`Podesavanja` (
  `id` INT UNSIGNED NOT NULL,
  `ProblemType` VARCHAR(256) NULL,
  `LearningRate` FLOAT NULL,
  `BatchSize` INT NULL,
  `numberOfEpochs` INT NULL,
  `InputSize` INT NULL,
  `OutputSize` INT NULL,
  `HiddenLayers` VARCHAR(256) NULL,
  `AktivacioneFunkcije` VARCHAR(256) NULL,
  `RegularizationMethod` VARCHAR(256),
  `RegularizationRate` float null,
  `LossFunction` VARCHAR(256),
  `Optimizer` VARCHAR(256),
  `UlazneKolone` VARCHAR(256),
  `IzlazneKolone` VARCHAR(256),
  PRIMARY KEY (`id`),
  CONSTRAINT `model`
    FOREIGN KEY (`id`)
    REFERENCES `Baza`.`model` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
