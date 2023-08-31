const pool = require("./../db");
const queries = require("./queries");
const { all } = require("./routes");

// const addUser = (req, res) => {
//   console.log("Adding new user");
//   console.log(req.body);
//   const { username, name, email, address, password } = req.body;

//   pool.query(queries.checkUsernameExists, [username], (error, results1) => {
//     pool.query(
//       "SELECT s FROM admin s WHERE s.username=$1",
//       [username],
//       (error, results2) => {
//         if (results1.rows.length || results2.rows.length) {
//           res.redirect(302, "/login?registered");
//           //res.send("Username already exists. Choose another.");
//         } else {
//           pool.query(
//             queries.addUser,
//             [username, name, email, address, password],
//             (error, results) => {
//               if (error) throw error;
//               res.redirect(302, "/login");

//               // res.status(201).send("User is registered");
//             }
//           );
//         }
//       }
//     );
//   });
// };

const addUser = (req, res) => {
  console.log("Adding new user");
  console.log(req.body);
  const { username, name, email, password } = req.body;

  pool.query(queries.checkUsernameExists, [username], (error, results1) => {
    pool.query(
      "SELECT s FROM admin s WHERE s.username=$1",
      [username],
      (error, results2) => {
        if (results1.rows.length || results2.rows.length) {
          res
            .status(400)
            .json({ error: "Username already exists. Choose another." });
        } else {
          pool.query(
            "SELECT s FROM user_ s WHERE s.email=$1",
            [email],
            (error, results7) => {
              if (results7.rows.length) {
                res
                  .status(400)
                  .json({ error: "Email already in use. Choose another." });
              } else {
                pool.query(
                  queries.addUser,
                  [username, name, email, password],
                  (error, results) => {
                    if (error) throw error;
                    res.status(302).send("Adding user");
                  }
                );
              }
            }
          );
        }
      }
    );
  });
};
const adminuser = (req, res) => {
  console.log("Adding new admin user");
  console.log(req.body);
  const { username, password } = req.body;

  pool.query(queries.checkUsernameExists, [username], (error, results1) => {
    pool.query(
      "SELECT s FROM admin s WHERE s.username=$1",
      [username],
      (error, results2) => {
        if (results1.rows.length || results2.rows.length) {
          res
            .status(400)
            .json({ error: "Username already exists. Choose another." });
        } else {
          pool.query(
            "INSERT INTO admin (username,password) VALUES ($1,$2)",
            [username, password],
            (error, results) => {
              if (error) throw error;
              res.status(302).json({message: "Admin User added"});
            }
          );
        }
      }
    );
  });
};

const search = (req, res) => {
  const { source, destination } = req.query;
  pool.query(queries.search, [source, destination], (error, results) => {
    // if (error) throw error;
    if (!results.rows.length) {
      return res.render("show_trains", {
        message: "Trains are not available for given Source and Destination",
        results: [],
      });
    } else {
      return res.render("show_trains", {
        message: "",
        results: results.rows,
      });
    }
  });
};

const login = (req, res) => {
  console.log(req.body);
  const { username, password } = req.body;

  pool.query(queries.usercreated, [username, password], (error, results) => {
    if (error) throw error;
    if (!results.rows.length) {
      pool.query(
        "SELECT s FROM admin s WHERE s.username=$1 and s.password=$2",
        [username, password],
        (error, results1) => {
          if (error) throw error;
          if (!results1.rows.length) {
            res.status(400).json({ error: "You are not registered" });
          } else {
            req.session.username = username;
            req.session.pass = password;
            res.status(302).send("Admin Logged in");
          }
        }
      );
      // res.send("You are not registered");
    } else {
      var parentname = __dirname.replace("src", "");
      console.log(parentname + "/frontend/SrcDes.html");
      req.session.username = username;
      req.session.pass = password;
      res.status(200).send("User Logged in");
    }
  });
};

const bookuser = (req, res) => {
  console.log("Entered bookuser");
  const { train_no, date, coach, source, destination } = req.body;
  pool.query(
    queries.checkTicketUser,
    [req.session.username],
    (error, results) => {
      if (results.rows.length) {
        // res.send("Pnr already generated. You can add the passengers.");
        res.status(200).json({
          message: `User already booked with PNR-No = ${results.rows[0].pnr_no}. You can add the passengers.`,
        });
      } else {
        pool.query(
          queries.checkUsernameExists,
          [req.session.username],
          (error, results) => {
            if (!results.rows.length) {
              // res.send("Invalid Username.");
              res.status(400).json({ alert: "Invalid Username." });
            } else {
              pool.query(
                queries.bookuser,
                [
                  train_no,
                  date,
                  coach,
                  req.session.username,
                  source,
                  destination,
                ],
                (error, results) => {
                  if (error) throw error;
                  else {
                    pool.query(
                      queries.takepnr,
                      [
                        train_no,
                        date,
                        coach,
                        req.session.username,
                        source,
                        destination,
                      ],

                      (error, results) => {
                        if (error) throw error;
                        console.log(results.rows);
                        // res.send(
                        //   `Your pnr no. is ${results.rows[0].pnr_no}. Now you can add passengers using the generated pnr`
                        // );
                        res.status(200).json({
                          message: `Your pnr no. is ${results.rows[0].pnr_no}. Now you can add passengers using the generated pnr`,
                        });
                      }
                    );
                  }
                }
              );
            }
          }
        );
      }
    }
  );
  console.log("Exited");
};

const addpass = (req, res) => {
  // console.log(req.body);
  const { name, age, gender } = req.body;
  pool.query(
    "SELECT s.pnr_no FROM ticket s WHERE s.username=$1",
    [req.session.username],
    (error, results) => {
      if (error) throw error;
      if (!results.rows.length) {
        res
          .status(400)
          .json({ error: "Pnr is not generated.So,first of all, Book User" });
      } else {
        pool.query(
          queries.pnrpresent,
          [results.rows[0].pnr_no],
          (error, results1) => {
            if (error) throw error;
            if (!results1.rows.length) {
              res.status(400);
              json({
                error: "Pnr is not generated.So,first of all, Book User",
              });
              console.log("train_released data", results1.rows);
            } else {
              console.log("train_released data", results1.rows);
              const coach = results1.rows[0].coach;
              const coachWithSuffix = coach + "_available";
              pool.query(
                `SELECT s.${coachWithSuffix} FROM train_released s WHERE s.train_no=$1 and s.date=$2 and s.source=$3 and s.destination=$4`,
                [
                  results1.rows[0].train_no,
                  results1.rows[0].date,
                  results1.rows[0].source,
                  results1.rows[0].destination,
                ],
                (error, result2) => {
                  console.log("seat count is=", result2);
                  if (error) throw error;
                  if (result2.rows[0][coachWithSuffix] <= 0) {
                    res.status(400).json({
                      error: `No more seats are available in the ${results1.rows[0].coach.toUpperCase()} Coach`,
                    });
                  } else {
                    pool.query(
                      queries.addpass,
                      [name, age, gender, results.rows[0].pnr_no],
                      (error, results2) => {
                        if (error) throw error;
                        else {
                          res.status(405).json({ message: "Passenger added" });
                        }
                      }
                    );
                  }
                }
              );
            }
          }
        );
      }
    }
  );
};

const cancelticket = (req, res) => {
  console.log(req.body);
  // const { username, password } = req.body;
  pool.query(
    queries.usercreated,
    [req.session.username, req.session.pass],
    (error, results) => {
      if (error) throw error;
      else {
        console.log(req.body);
        if (!results.rows.length) {
          res.send("Invalid details");
        } else {
          pool.query(
            queries.deleteticket,
            [req.session.username],
            (error, results) => {
              if (error) throw error;
              else {
                const deleteQuery = "DELETE FROM user_ s WHERE s.username=$1";
                const dropQuery = `DROP USER IF EXISTS ${req.session.username}`;

                pool.query(
                  deleteQuery,
                  [req.session.username],
                  (error, results) => {
                    if (error) {
                      throw error;
                    } else {
                      pool.query(dropQuery, (error, results) => {
                        if (error) {
                          throw error;
                        } else {
                          console.log(req.body);
                          req.session.destroy();
                          res.redirect(302, "/signup");
                        }
                      });
                    }
                  }
                );
              }
            }
          );
        }
      }
    }
  );
};

const showticket = (req, res) => {
  pool.query(
    "SELECT s.train_no,s.date FROM ticket s WHERE s.username=$1",
    [req.session.username],
    (error, results) => {
      if (error) throw error;
      else {
        if (!results.rows.length) {
          return res.render("train_details", {
            message: "No passengers found",
            results: [], // Pass an empty array to avoid rendering table rows
          });
        }
        pool.query(
          queries.checkticket,
          [
            req.session.username,
            results.rows[0].train_no,
            results.rows[0].date,
          ],
          (error, results2) => {
            if (error) throw error;
            else {
              if (!results2.rows.length) {
                return res.render("train_details", {
                  message: "Invalid ticket details",
                  results: [], // Pass an empty array to avoid rendering table rows
                });
              } else {
                pool.query(
                  "DELETE FROM seating_plan",
                  [],
                  (error, results3) => {
                    if (error) throw error;
                    else {
                      pool.query(
                        queries.seatingplan,
                        [results.rows[0].train_no, results.rows[0].date],
                        (error, results4) => {
                          if (error) throw error;
                          else {
                            pool.query(
                              queries.selectpnr,
                              [req.session.username],
                              (error, results5) => {
                                if (error) throw error;
                                else {
                                  pool.query(
                                    "SELECT s.name,s.age,s.gender,s.coach_no,s.berth_no,s.pnr_no,s.source,s.destination FROM seating_plan s WHERE s.pnr_no=$1",
                                    [results5.rows[0].pnr_no],
                                    (error, results) => {
                                      if (error) throw error;
                                      else {
                                        if (!results.rows.length) {
                                          return res.render("train_details", {
                                            message: "Nothing added",
                                            results: [], // Pass an empty array to avoid rendering table rows
                                          });
                                        } else {
                                          console.log(results.rows);
                                          return res.render("train_details", {
                                            message: "", // Empty message
                                            results: results.rows,
                                          });
                                        }
                                      }
                                    }
                                  );
                                }
                              }
                            );
                          }
                        }
                      );
                    }
                  }
                );
              }
            }
          }
        );
      }
    }
  );
};

// const showticket = (req, res) => {
//   pool.query(
//     "SELECT s.train_no,s.date FROM ticket s WHERE s.username=$1",
//     [req.session.username],
//     (error, results) => {
//       if (error) throw error;
//       else {
//         if (!results.rows.length) {
//           res.send("No passengers found");
//           return;
//         }
//         pool.query(
//           queries.checkticket,
//           [
//             req.session.username,
//             results.rows[0].train_no,
//             results.rows[0].date,
//           ],
//           (error, results2) => {
//             if (error) throw error;
//             else {
//               if (!results2.rows.length) {
//                 res.send("Invalid ticket details");
//               } else {
//                 // console.log(train_no, date);

//                 pool.query(
//                   "DELETE FROM seating_plan",
//                   [],
//                   (error, results3) => {
//                     if (error) throw error;
//                     else {
//                       pool.query(
//                         queries.seatingplan,
//                         [results.rows[0].train_no, results.rows[0].date],
//                         (error, results4) => {
//                           if (error) throw error;
//                           else {
//                             pool.query(
//                               queries.selectpnr,
//                               [req.session.username],
//                               (error, results5) => {
//                                 if (error) throw error;
//                                 else {
//                                   pool.query(
//                                     "SELECT s.name,s.age,s.gender,s.coach_no,s.berth_no,s.pnr_no,s.source,s.destination FROM seating_plan s WHERE s.pnr_no=$1",
//                                     [results5.rows[0].pnr_no],
//                                     (error, results) => {
//                                       if (error) throw error;
//                                       else {
//                                         if (!results.rows.length) {
//                                           res.status(300).json("Nothing added");
//                                         } else {
//                                           // res.status(301).json(results.rows);
//                                           console.log(results.rows);
//                                           return res.render("train_details", {
//                                             results: results.rows,
//                                           });
//                                         }
//                                       }
//                                     }
//                                   );
//                                 }
//                               }
//                             );
//                           }
//                         }
//                       );
//                     }
//                   }
//                 );
//               }
//             }
//           }
//         );
//       }
//     }
//   );
// };

const availabletrain = (req, res) => {
  pool.query(
    "SELECT s.train_no,s.date,s.ac_num,s.sleeper_num,s.inactive FROM train s",
    [],
    (error, results) => {
      if (!results.rows.length) {
        res.send("No trains available");
      } else {
        return res.render("show_avtrain", {
          results: results.rows,
        });
      }
    }
  );
};

const release_train = (req, res) => {
  let { train_no, date, ac, sleeper, ac_, sleeper_, src, des } = req.body;
  ac = parseInt(ac);
  sleeper = parseInt(sleeper);
  ac_ = parseInt(ac_);
  sleeper_ = parseInt(sleeper_);
  console.log(typeof ac);
  if (ac_ > ac || ac <= 0 || sleeper_ > sleeper || sleeper_ <= 0) {
    res.send("Invalid Input");
  }
  pool.query(
    queries.releasetrain,
    [train_no, date, src, des, ac_, sleeper_],
    (error, results) => {
      if (error) {
        // console.log(this.sql);
        throw error;
      } else {
        if (ac_ > ac || ac <= 0 || sleeper_ > sleeper || sleeper_ <= 0) {
          res.send("Invalid Input");
        } else {
          if (ac == ac_ || sleeper == sleeper_) {
            pool.query(
              queries.revisetrain,
              [train_no, date],
              (error, results) => {
                if (error) {
                  // console.log(this.sql);
                  throw error;
                }
              }
            );
          }
          pool.query(
            queries.update_train,
            [train_no, date, ac, sleeper],
            (error, results) => {
              if (error) throw error;
              else {
                res.redirect("/availabletrain");
              }
            }
          );
        }
      }
    }
  );
  console.log(req.body);
};

// const release_train = async (req, res) => {
//   const { train_no, date, ac, sleep, src, des } = req.body;
//   const [rows, fields, query] = await pool.query(queries.releasetrain, [
//     train_no,
//     date,
//     src,
//     des,
//     ac,
//     sleep,
//   ]);
//   console.log("query.sql", query.sql);
//   const [rows2, fields2, query2] = await pool.query(queries.revisetrain, [
//     train_no,
//     date,
//     ac,
//     sleep,
//   ]);
//   console.log(query2.sql);
//   console.log(req.body);
//   res.redirect("/availabletrain");
// };

const allavtrain = (req, res) => {
  pool.query(
    "SELECT s.date,s.train_no,s.ac_available,s.sleeper_available,s.source,s.destination FROM train_released s",
    [],
    (error, results) => {
      // if (error) throw error;
      if (!results.rows.length) {
        res.send("No trains available");
      } else {
        return res.render("show_releasetrain", {
          results: results.rows,
        });
      }
    }
  );
};

module.exports = {
  addUser,
  login,
  search,
  bookuser,
  addpass,
  cancelticket,
  showticket,
  availabletrain,
  release_train,
  allavtrain,
  adminuser,
};
