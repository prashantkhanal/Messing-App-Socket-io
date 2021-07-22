import {
  Box,
  Container,
  makeStyles,
  Typography,
  TextField,
  Paper,
  Divider,
} from '@material-ui/core';
import SendIcon from '@material-ui/icons/Send';

import { io } from 'socket.io-client';
import logo from './assets/chat.png';
import { useEffect, useRef, useState } from 'react';
import { IconButton } from '@material-ui/core';

const socket = io('http://localhost:5000');

const useStyles = makeStyles({
  icon: {
    display: 'none',
  },
});

function App() {
  const classes = useStyles();
  const [step, setStep] = useState(1);
  const [createUser, setCreateUser] = useState('');
  const [user, setUser] = useState({});
  const [message, setMessage] = useState('');
  const [reciver, setReciver] = useState('');
  const [media, setMedia] = useState('');

  const [groupMessage, setGroupMessage] = useState({});
  const reciverRef = useRef(null);
  const sortMessage = (userName1, userName2) => {
    return [userName1, userName2].sort().join(' - ');
  };

  const checkGroupMsg = groupMessage
    ? groupMessage[sortMessage(createUser, reciver)]
    : [];

  const createUsers = () => {
    console.log(createUser);
    socket.emit('new_user', createUser);
    setStep((prevStep) => prevStep + 1);
  };
  const onUserSelect = (createUser) => {
    setReciver(createUser);
    reciverRef.current = createUser;
    setStep((prevStep) => prevStep + 1);
  };
  const handleMessge = (e) => {
    e.preventDefault();
    console.log(message);
    const data = {
      sender: createUser,
      message,
      reciver,
      media,
    };
    socket.emit('send_message', data);

    const key = sortMessage(createUser, reciver);
    const tempGroupMessage = { ...groupMessage };
    if (key in tempGroupMessage) {
      tempGroupMessage[key] = [...tempGroupMessage[key], data];
    } else {
      tempGroupMessage[key] = [data];
    }
    // setMessage({ ...groupMessage });
    setGroupMessage({ ...tempGroupMessage });
  };

  useEffect(() => {
    socket.on('all_users', (users) => {
      setUser(users);
    });
    socket.on('new_message', (data) => {
      console.log(data);

      setGroupMessage((prevGroupMessage) => {
        const messages = { ...prevGroupMessage };
        const key = sortMessage(data.sender, data.reciver);
        if (key in messages) {
          messages[key] = [...messages[key], data];
        } else {
          messages[key] = [data];
        }
        return { ...messages };
      });
    });
  }, []);
  return (
    // <ThemeProvider theme={darkTheme}>
    <Container className={classes.root}>
      <Box
        className={classes.logo}
        justifyContent="center"
        alignContent="center"
        display="flex"
        m={3}
      >
        <img
          width="80"
          src={logo}
          alt="chatlogo"
          style={{ marginBottom: '50px' }}
        />
        <Typography variant="h6">Prashant Private Chat</Typography>
      </Box>
      {step === 1 && (
        <Box
          className={classes.logo}
          justifyContent="center"
          alignContent="center"
          display="flex"
          m={3}
        >
          <Paper>
            {/* step1 ask username or email */}
            <form onSubmit={createUsers} style={{ margin: '50px 20px' }}>
              <Typography variant="h6" style={{ textAlign: 'center' }}>
                Enter Your username
              </Typography>
              <TextField
                style={{ margin: '50px 20px' }}
                value={createUser}
                onChange={(e) => setCreateUser(e.target.value)}
                variant="outlined"
                label="User name"
              />
            </form>
          </Paper>
        </Box>
      )}
      {/* step show the online user*/}
      {step === 2 && (
        <Box
          className={classes.logo}
          justifyContent="center"
          alignContent="center"
          display="flex"
          m={3}
        >
          <Paper style={{ borderRadius: '10px' }}>
            <Typography
              variant="h6"
              style={{
                textAlign: 'center',
                margin: '10px 0px',
              }}
            >
              Online Users
            </Typography>
            <ul>
              {user &&
                Object.keys(user).map((e, i) => (
                  <>
                    {e !== createUser && (
                      <li
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          width: '500px',
                          margin: '15px',
                          cursor: 'pointer',
                        }}
                        onClick={() => onUserSelect(e)}
                        key={i}
                      >
                        <Typography>{e}</Typography>
                        <Typography>3</Typography>
                        <Divider />
                      </li>
                    )}
                  </>
                ))}
            </ul>
          </Paper>
        </Box>
      )}
      {step === 3 && (
        <Box
          className={classes.logo}
          justifyContent="center"
          alignContent="center"
          display="flex"
          m={3}
        >
          <Paper>
            <Box>
              <Typography
                variant="h6"
                style={{ margin: '10px', textAlign: 'center' }}
              >
                {reciver}
              </Typography>
            </Box>
            <Box>
              <ul>
                {checkGroupMsg && checkGroupMsg.length > 0
                  ? checkGroupMsg.map((msg, index) => (
                      <li key={index} style={{ margin: '20px' }}>
                        <Box>
                          <img
                            src={require('./assets/1.png').default}
                            alt="user"
                            style={{ marginRight: '20px' }}
                          />
                          <Box style={{ display: 'inline-block' }}>
                            <span>{msg.message} </span>
                          </Box>
                        </Box>
                      </li>
                    ))
                  : null}
              </ul>
            </Box>
            <form onSubmit={handleMessge} style={{ marginTop: '20px' }}>
              <TextField
                variant="outlined"
                placeholder="Enter your message here !!"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <IconButton variant="contained" color="primary" type="submit">
                <SendIcon />
              </IconButton>
              {/* {setMessage('')} */}
            </form>
          </Paper>
        </Box>
      )}
    </Container>
  );
}

export default App;
