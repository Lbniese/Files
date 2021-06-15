USE `heroku_41151142c290339`;

DROP TABLE IF EXISTS `accounts`;

CREATE TABLE IF NOT EXISTS `accounts` (
  `id` int(11) NOT NULL PRIMARY KEY AUTO_INCREMENT,
  `username` varchar(50) NOT NULL UNIQUE,
  `password` varchar(255) NOT NULL
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;

#INSERT INTO `accounts` (`id`, `username`, `password`) VALUES (1, 'user', '$2b$11$BJDYOCs7cq.PsXg.XACdW.v/hZ910o98jm3ywgsXvmEBuhxLwrMjG');
#INSERT INTO `accounts` (`id`, `username`, `password`) VALUES (2, 'root', '$2b$11$5dEjvZTU1AhqiqHvTIq1fOPlRJLDr1RlZxU9mUQbd79ekysRHH3Oy');

SELECT * FROM accounts;