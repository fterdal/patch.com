const Sequelize = require('sequelize');
const db = new Sequelize('postgres://localhost/patch_com', {
  logging: false,
});

const Pirate = db.define('pirate', {
  name: {
    type: Sequelize.STRING,
    allowNull: false,
    defaultValue: 'Chestaaaaaargh',
    validate: {
      notEmpty: true,
    }
  },
  scurvy: {
    type: Sequelize.BOOLEAN,
    defaultValue: true,
  },
});

Pirate.beforeCreate((pirate) => {
  // console.log('pirate.name:', pirate.name)
  pirate.name += ' the Pirate!!!';
});

const Ship = db.define('ship', {
  size: Sequelize.ENUM('small', 'medium', 'large'), /* eslint new-cap:0 */
  sails: {
    type: Sequelize.INTEGER,
    validate: { min: 1, max: 10 }
  }
})

// Both of these create a one-to-many relationship, where one ship has many pirates
Ship.hasMany(Pirate); // This creates the magic methods on ships (e.g. ship.addPirate)
Pirate.belongsTo(Ship); // This creates the magic methods on pirates  (e.g. pirate.setShip)

const fakeShips = [
  {
    size: 'small',
    sails: 2,
  },
  {
    size: 'large',
    sails: 10,
  },
]

const fakePirates = [
  {
    name: 'Captain Crunch',
  },
  {
    name: 'Black Beard',
    scurvy: false,
  },
  {
    name: 'Smitty',
  },
]

async function seed() {
  try {
    await db.sync({ force: true })
    ///// CREATE SHIPS /////
    const shipsPromise = fakeShips.map(ship => Ship.create(ship));
    const [ small, large ] = await Promise.all(shipsPromise)
    ///// CREATE PIRATES /////
    const piratesPromise = fakePirates.map(pirate => Pirate.create(pirate));
    const [ crunch, beard, smitty] = await Promise.all(piratesPromise)
    // console.log(crunch.name);
    await small.addPirate(crunch);
    // await crunch.setShip(large);
    ///// CLOSE THE DATABASE /////
    db.close();
  } catch(err) {
    console.error(err);
    db.close();
  }
}
seed();
