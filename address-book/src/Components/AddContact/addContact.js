import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import axios from "axios";
import { withStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import MuiDialogTitle from "@material-ui/core/DialogTitle";
import MuiDialogContent from "@material-ui/core/DialogContent";
import MuiDialogActions from "@material-ui/core/DialogActions";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import TextField from "@material-ui/core/TextField";
import jwt from "jsonwebtoken";

import { makeStyles, useTheme } from "@material-ui/core/styles";
import Input from "@material-ui/core/Input";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import ListItemText from "@material-ui/core/ListItemText";
import Select from "@material-ui/core/Select";
import Checkbox from "@material-ui/core/Checkbox";
import Chip from "@material-ui/core/Chip";

const styles = theme => ({
  root: {
    margin: 0,
    padding: theme.spacing(2)
  },
  closeButton: {
    position: "absolute",
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500]
  }
});
const useStyles = makeStyles(theme => ({
  formControl: {
    width: "100%"
  },
  chips: {
    display: "flex",
    flexWrap: "wrap"
  },
  chip: {
    margin: 2
  },
  noLabel: {
    marginTop: theme.spacing(3)
  }
}));

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250
    }
  }
};

const DialogTitle = withStyles(styles)(props => {
  const { children, classes, onClose, ...other } = props;
  return (
    <MuiDialogTitle disableTypography className={classes.root} {...other}>
      <Typography variant="h6">{children}</Typography>
      {onClose ? (
        <IconButton
          aria-label="close"
          className={classes.closeButton}
          onClick={onClose}
        >
          <CloseIcon />
        </IconButton>
      ) : null}
    </MuiDialogTitle>
  );
});
const DialogContent = withStyles(theme => ({
  root: {
    padding: theme.spacing(2)
  }
}))(MuiDialogContent);
const DialogActions = withStyles(theme => ({
  root: {
    margin: 0,
    padding: theme.spacing(1)
  }
}))(MuiDialogActions);

export default function AddContact({ open, handleClose }) {
  const [lastname, setLastName] = useState("");
  const [firstname, setFirstName] = useState("");
  const [home_phone, setHome_phone] = useState("");
  const [work_phone, setWork_phone] = useState("");
  const [mobile_phone, setMobile_phone] = useState("");
  const [city, setCity] = useState("");
  const [email, setEmail] = useState("");
  const [state_or_province, setStateOrProvince] = useState("");
  const [postal_code, setPostalCode] = useState("");
  const [country, setCountry] = useState("");
  const tokenDecoded = jwt.decode(localStorage.getItem("Token"));
  const [errorMsgFirstname, setErrorMsgFirstname] = useState("");

  const [groupList, setGroupList] = useState([]);
  const classes = useStyles();
  const [groups, setGroups] = useState([]);
  const handleChange = event => setGroups(event.target.value);

  useEffect(() => {
    async function result() {
      await axios({
        method: "get",
        url: `http://localhost:3004/groupcontacts/${tokenDecoded.userId}`
      })
        .then(res => {
          setGroupList(res.data);
        })
        .catch(err => console.log(err));
    }
    result();
  }, [tokenDecoded.userId]);

  const handleSave = () => {
    if (firstname !== "") {
      // console.log("hello");
      setErrorMsgFirstname("");
      axios
        .post(`http://localhost:3004/contacts/${tokenDecoded.userId}`, {
          firstname: firstname,
          lastname: lastname,
          home_phone: home_phone,
          work_phone: work_phone,
          mobile_phone: mobile_phone,
          city: city,
          email: email,
          state_or_province: state_or_province,
          postal_code: postal_code,
          country: country
        })
        .then(res => {
          groups.map(group => {
            // console.log(group);
            axios.post(`http://localhost:3004/groupmembers/`, {
              contactid: res.data.id,
              groupid: group
            });
            handleClose();
            Swal.fire({
              title: "Contact Added Successfully",
              icon: "success"
            }).then(() => {
              window.location = "/addressbook";
            });
          });
        })
        .catch(e => {
          Swal.fire({
            icon: "error",
            title: "Failed to Add Contact",
            text: e
          });
        });
    } else {
      setErrorMsgFirstname("This field is required");
      Swal.fire({
        title: "Failed to add new contact",
        text: "Firstname Required",
        icon: "error"
      });
    }
  };

  return (
    <Dialog
      onClose={handleClose}
      aria-labelledby="customized-dialog-title"
      open={open}
    >
      <DialogTitle id="customized-dialog-title" onClose={handleClose}>
        Add Contact
      </DialogTitle>
      <DialogContent dividers>
        <form>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={12}>
              <FormControl className={classes.formControl}>
                <InputLabel id="demo-mutiple-checkbox-label">
                  Group List
                </InputLabel>
                <Select
                  labelId="demo-mutiple-checkbox-label"
                  id="demo-mutiple-checkbox"
                  multiple
                  value={groups}
                  onChange={handleChange}
                  input={<Input />}
                  renderValue={selected => selected.join(", ")}
                  MenuProps={MenuProps}
                >
                  {groupList.map((data, key) => (
                    <MenuItem key={key} value={data.id}>
                      <Checkbox checked={groups.indexOf(data.groupname) < -1} />
                      <ListItemText primary={data.groupname} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                error={errorMsgFirstname === "" ? false : true}
                helperText={errorMsgFirstname ? errorMsgFirstname : ""}
                required
                id="firstname"
                name="firstname"
                label="First name"
                fullWidth
                autoComplete="firstname"
                onChange={e => setFirstName(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                id="lastname"
                name="lastname"
                label="Last name"
                fullWidth
                autoComplete="lastname"
                onChange={e => setLastName(e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                id="home_phone"
                name="home_phone"
                label="Home Phone Number"
                fullWidth
                onChange={e => setHome_phone(e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                id="mobile_phone"
                name="mobile_phone"
                label="Mobile Phone Number"
                fullWidth
                onChange={e => setMobile_phone(e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                id="work_phone"
                name="work_phone"
                label="Work Phone Number"
                fullWidth
                onChange={e => setWork_phone(e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                id="email"
                name="email"
                label="Email Address"
                fullWidth
                autoComplete="email"
                onChange={e => setEmail(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                id="city"
                name="city"
                label="City"
                fullWidth
                onChange={e => setCity(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                id="state_or_province"
                name="state"
                label="State/Province/Region"
                fullWidth
                onChange={e => setStateOrProvince(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                id="postal_code"
                name="postal_code"
                label="Zip / Postal code"
                fullWidth
                onChange={e => setPostalCode(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                id="country"
                name="country"
                label="Country"
                fullWidth
                onChange={e => setCountry(e.target.value)}
              />
            </Grid>
          </Grid>
        </form>
      </DialogContent>
      <DialogActions style={{ display: "flext", justifyContent: "flex-end" }}>
        <Button
          size="small"
          variant="contained"
          color="secondary"
          onClick={handleClose}
        >
          Cancel
        </Button>
        <Button
          size="small"
          variant="contained"
          color="primary"
          onClick={handleSave}
        >
          Save Contact
        </Button>
      </DialogActions>
    </Dialog>
  );
}
