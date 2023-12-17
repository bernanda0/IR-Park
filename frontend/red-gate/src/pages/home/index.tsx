import axios, { AxiosError, HttpStatusCode } from "axios";
import { useState, useEffect } from "react";
import { useCookies } from "react-cookie";
import checkAndRenewToken from "../../utils/renewToken";
import Popup from "../popup";
import CarPlateComponent from "../../component/CarPlate";
import DisplayIDComponent from "../../component/DisplayID";
import LogoutIcon from "@mui/icons-material/Logout";
import AppRegistrationIcon from "@mui/icons-material/AppRegistration";
import DataArrayIcon from "@mui/icons-material/DataArray";
import {
  Backdrop,
  Box,
  Fade,
  Modal,
  Table,
  TableBody,
  TableCell,
  TableRow
} from "@mui/material";

const style = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 600,
  height: 512, // Set the height for scrollability
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
  borderRadius: '12px',
  overflowY: 'auto',
  '&::-webkit-scrollbar': {
    width: '12px',
  },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: '#888',
  },
  '&::-webkit-scrollbar-track': {
    backgroundColor: '#f1f1f1',
  },
};


function HomePage() {
  const [plateID, setPlateID] = useState("");
  const [isSubscribe, setIsSubscribe] = useState(false);
  const [plateNumber, setPlateNumber] = useState("");
  const [logData, setLogData] = useState<LogData[]>([]);
  const [open, setOpen] = useState(false);
  const [registerPlateSuccess, setRegisterPlate] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [cookies, setCookie, removeCookies] = useCookies([
    "accessToken",
    "refreshToken",
    "accessTokenEx",
    "userID",
  ]);
  const renewTokenParam: RenewToken = {
    accessTokenExpire: new Date(cookies.accessTokenEx),
    refreshToken: cookies.refreshToken,
  };

  const handleClose = () => setOpen(false);

  const instance = axios.create({
    baseURL: "http://172.173.157.174:4444/", // Replace with your API base UR
  });

  useEffect(() => {
    checkAndRenewToken(renewTokenParam, setCookie).then(getID);
    // setInterval(getHistory, 2000);
  }, [, registerPlateSuccess]);

  const handleRegister = () => {
    checkAndRenewToken(renewTokenParam, setCookie).then(registerPlate);
    getID();
  };

  const handleLogout = () => {
    removeCookies("accessToken");
    removeCookies("accessTokenEx");
    removeCookies("refreshToken");
    removeCookies("userID");
  };

  const handleShowWarning = (message: string) => {
    setErrorMessage(message);
    setShowWarning(true);
  };

  const handleCloseWarning = () => {
    setShowWarning(false);
    setErrorMessage("");
  };

  const getID = () => {
    instance
      .get("/plate/getID", {
        headers: {
          Authorization: `Bearer ${cookies.accessToken}`,
        },
      })
      .then((response) => {
        if (response.status == 200) {
          const { v_id, is_subscribe } =
            response.data as getPlateIDResponseJson;
          setPlateID(v_id);
          setIsSubscribe(is_subscribe.Bool);
        }
      })
      .catch(() => {});
  };

  const registerPlate = () => {
    const formData = new URLSearchParams();
    formData.append("account_id", cookies.userID);
    formData.append("plate_number", plateNumber);

    instance
      .post("http://localhost:4444/plate/create", formData, {
        headers: {
          Authorization: `Bearer ${cookies.accessToken}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      })
      .then((response) => {
        if (response.status == HttpStatusCode.Created) {
          setRegisterPlate(true);
        } else {
        }
      })
      .catch((err) => {
        if (axios.isAxiosError(err)) {
          const axiosErr = err as AxiosError;
          const errorMessage = axiosErr.response?.data;
          handleShowWarning(`An error occurred: ${errorMessage}`);
        }
      });
  };

  const getHistory = () => {
    const params = {
      account_id: cookies.userID,
    };

    checkAndRenewToken(renewTokenParam, setCookie).then(() => {
      instance
        .get("/logs", {
          params,
          headers: {
            Authorization: `Bearer ${cookies.accessToken}`,
          },
        })
        .then((response) => {
          if (response.data) {
            let data = response.data as LogData[];
            data.sort((a, b) => {
              // Convert timestamps to Date objects for comparison
              const dateA = new Date(a.transaction_time.Time).getTime();
              const dateB = new Date(b.transaction_time.Time).getTime();
            
              // Compare and sort
              return dateB - dateA;
            });
            setLogData(data);
            setOpen(true);
          } else {
            setLogData([]);
          }
        });
    });
  };

  return (
    <div>
      {!plateID ? (
        <div>
          <CarPlateComponent
            initialPlateNumber={plateNumber}
            setPlateNumber={setPlateNumber}
          ></CarPlateComponent>
          <div className="flex items-center justify-center">
            <div className="mr-2 justify-center">
              <AppRegistrationIcon />
            </div>
            <button className="w-36" onClick={handleRegister}>
              Register Plate
            </button>
          </div>
          {showWarning && (
            <Popup message={errorMessage} onClose={handleCloseWarning} />
          )}
        </div>
      ) : (
        <div>
          <DisplayIDComponent
            plateID={plateID}
            isSubscribe={isSubscribe}
          ></DisplayIDComponent>
        </div>
      )}
      <div className="flex items-center justify-center">
        <div className="mr-2 justify-center">
          <DataArrayIcon />
        </div>
        <button className="w-36 hover:border-green-600" onClick={getHistory}>
          See History
        </button>
      </div>
      <div className="flex items-center justify-center">
        <div className="mr-1 justify-center">
          <LogoutIcon />
        </div>
        <button className="w-36 hover:border-red-600" onClick={handleLogout}>
          Log Out
        </button>
      </div>
      <div>
        <Modal
          aria-labelledby="transition-modal-title"
          aria-describedby="transition-modal-description"
          open={open}
          onClose={handleClose}
          closeAfterTransition
          BackdropComponent={Backdrop}
          BackdropProps={{
            timeout: 500,
          }}
        >
          <Fade in={open}>
            <Box sx={style}>
              <Table>
                <TableBody>
                  {/* Column names */}
                  <TableRow>
                    <TableCell>
                      <strong>Event ID</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Location</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Transaction Time</strong>
                    </TableCell>
                  </TableRow>

                  {logData.map((entry, index) => (
                    <TableRow key={index}>
                      <TableCell>{entry.event_id}</TableCell>
                      <TableCell>{entry.location?.String}</TableCell>
                      <TableCell>{entry.transaction_time?.Time}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Fade>
        </Modal>
      </div>
    </div>
  );
}

export default HomePage;
