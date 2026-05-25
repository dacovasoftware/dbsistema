const bcrypt = require('bcryptjs');

const password = '123456';

bcrypt.hash(password, 10, (error, hash) => {

  if (error) {
    console.log(error);
  } else {

    console.log('HASH GENERADO:');
    console.log(hash);

  }

});