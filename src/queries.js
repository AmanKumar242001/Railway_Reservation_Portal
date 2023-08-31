const addUser =
  "INSERT INTO user_ (username,name,email,password) VALUES ($1,$2,$3,$4)";
const checkUsernameExists = "SELECT s FROM user_ s WHERE s.username=$1";
const usercreated =
  "SELECT s FROM user_ s WHERE s.username=$1 and s.password=$2";
const search =
  "SELECT s.date,s.train_no,s.ac_available,s.sleeper_available,s.source,s.destination FROM train_released s WHERE s.source=$1 and s.destination=$2";
const bookuser =
  "INSERT INTO ticket (train_no,date,coach,username,source,destination) VALUES ($1,$2,$3,$4,$5,$6)";
const checkTicketUser = "SELECT s.pnr_no FROM ticket s WHERE s.username=$1";
const takepnr =
  "SELECT s.pnr_no FROM ticket s WHERE s.train_no=$1 and s.date=$2 and s.coach=$3 and s.username=$4 and s.source=$5 and s.destination=$6";
const addpass = "Call assign_berth($1,$2,$3,$4)";
const pnrpresent =
  "SELECT s.date,s.train_no,s.source,s.destination,s.coach FROM ticket s WHERE s.pnr_no = $1";
const deleteticket = "DELETE FROM ticket s WHERE s.username=$1";
const checkticket =
  "SELECT s FROM ticket s WHERE s.username=$1 and s.train_no=$2 and s.date=$3";
const seatingplan = "Call seating_plan($1,$2)";
const selectpnr = "SELECT s.pnr_no FROM ticket s WHERE s.username=$1";
const releasetrain =
  "INSERT INTO train_released (train_no,date,source,destination,ac_available,sleeper_available) VALUES ($1,$2,$3,$4,$5,$6)";
const revisetrain =
  "DELETE FROM train s WHERE s.train_no=$1 and s.date=$2 and s.ac_num=0 and sleeper_num=0";
const update_train =
  "UPDATE train  SET ac_num = $3 , sleeper_num = $4 , inactive = true WHERE train_no=$1 and date=$2";

module.exports = {
  addUser,
  checkUsernameExists,
  usercreated,
  search,
  bookuser,
  checkTicketUser,
  takepnr,
  addpass,
  pnrpresent,
  deleteticket,
  checkticket,
  seatingplan,
  selectpnr,
  releasetrain,
  revisetrain,
  update_train,
};
