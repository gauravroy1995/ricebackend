var mongoose = require("mongoose");
const sha256 = require("js-sha256").sha256;
const config = require("../../middleware/config");

//mongo connection options
mongoose.connect("mongodb://username:passowrd@ds115434.mlab.com:15434/rice", {
  useNewUrlParser: true
});
var db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error"));
db.once("open", function(callback) {
  console.log("Connection succeeded.");
});

//gets the next sequence that needs to be inserted on
function getNextSequence(db, name, callback) {
  db.collection("users").findAndModify(
    {
      _id: name
    },
    null,
    {
      $inc: {
        seq: 1
      }
    },
    {
      upsert: true,
      new: true
    },
    function(err, result) {
      if (err) callback(err, result);
      callback(err, result.value.seq);
    }
  );
}

//check if the user exsists, return true if the user exsists, however this method will not accept any password
const checkUserWithPin = (cardnumber, pin) => {
  return new Promise((resolve, reject) => {
    db.collection("users").findOne(
      {
        cardnumber: cardnumber,
        pin: pin
      },
      function(err, result) {
        if (err) {
          reject(false);
        }
        if (result) {
          resolve(result);
        } else {
          reject(false);
        }
      }
    );
  });
};

//check if the user exsists, return true if the user exsists, however this method will not accept any password
const checkUserWithoutPin = cardnumber => {
  return new Promise((resolve, reject) => {
    db.collection("users").findOne(
      {
        cardnumber: cardnumber
      },
      function(err, result) {
        if (err) {
          reject(false);
        }
        if (result) {
          resolve(true);
        } else {
          reject(false);
        }
      }
    );
  });
};
const registerUser = (req, res) => {
  let cardnumber = req.body.cardnumber;
  let pin = req.body.pin;
  // let password = req.body.password;
  //   const password = sha256.hmac(config.secret, req.body.password);
  checkUserWithoutPin(cardnumber)
    .then(returnType => {
      res.json({
        success: false,
        payload: {
          message: "Signup Failed"
        },
        error: {
          code: "PC05",
          message: "User already exsists"
        }
      });
    })
    .catch(error => {
      getNextSequence(db, "_id", (err, result) => {
        if (!err) {
          db.collection("users").insertOne({
            cardnumber: cardnumber,
            pin: pin,
            amount: 0
          });
          res.json({
            success: true,
            payload: {
              message: "Signup successful!"
            },
            error: {
              code: "",
              message: "No error"
            }
          });
        }
      });
    });
};

const checkIfCardIsValid = (req, res) => {
  let cardnumber = req.body.cardnumber;
  let pin = req.body.pin;

  checkUserWithPin(cardnumber, pin)
    .then(returnType => {
      res.json({
        success: true,
        payload: {
          message: "Card Exists"
        },
        error: {
          code: "",
          message: ""
        }
      });
    })
    .catch(err => {
      res.json({
        success: false,
        payload: {
          message: "Card Doesnt Exists"
        },
        error: {
          code: "",
          message: ""
        }
      });
    });
};

updateMoneyAmount = (req, res) => {
  let cardnumber = req.body.cardnumber;
  let pin = req.body.pin;
  let amount = Number(req.body.amount);

  checkUserWithPin(cardnumber, pin)
    .then(data => {
      //   console.log(data, "data insede");
      let amountToBeAdded = amount + Number(data.amount);
      let query = { cardnumber: cardnumber };
      db.collection("users").findOneAndUpdate(query, {
        $set: { amount: amountToBeAdded }
      });
      res.json({
        success: true,
        payload: {
          message: "Success"
        },
        error: {
          code: "",
          message: ""
        }
      });
    })
    .catch(err => {
      res.json({
        success: false,
        payload: {
          message: "Card Creds wrong"
        },
        error: {
          code: "",
          message: ""
        }
      });
    });
};

subtractAmount = (req, res) => {
  let cardnumber = req.body.cardnumber;
  let pin = req.body.pin;
  let amount = Number(req.body.amount);

  checkUserWithPin(cardnumber, pin)
    .then(data => {
      //   console.log(data, "data insede");
      let amountToBeAdded = Number(data.amount) - amount;
      let query = { cardnumber: cardnumber };
      db.collection("users").findOneAndUpdate(query, {
        $set: { amount: amountToBeAdded }
      });
      res.json({
        success: true,
        payload: {
          message: "Success"
        },
        error: {
          code: "",
          message: ""
        }
      });
    })
    .catch(err => {
      res.json({
        success: false,
        payload: {
          message: "Card Creds wrong"
        },
        error: {
          code: "",
          message: ""
        }
      });
    });
};

module.exports = {
  registerUser: registerUser,
  checkIfCardIsValid: checkIfCardIsValid,
  updateMoneyAmount: updateMoneyAmount,
  subtractAmount: subtractAmount
};
