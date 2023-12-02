import axios, { AxiosError, HttpStatusCode } from "axios";
import { useState, useEffect } from "react";
import { useCookies } from "react-cookie";
import checkAndRenewToken from "../../utils/renewToken";
import { generateInoContent } from "../../static/inoGenerator";
import Popup from "../popup";
import CarPlateComponent from "../../component/CarPlate";
import DisplayIDComponent from "../../component/DisplayID";
import LogoutIcon from "@mui/icons-material/Logout";
import AppRegistrationIcon from "@mui/icons-material/AppRegistration";
import DataArrayIcon from "@mui/icons-material/DataArray";
import {
  Backdrop,
  Box,
  Button,
  Fade,
  Modal,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { DownloadRounded, Money } from "@mui/icons-material";

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
  borderRadius: "12px",
  overflowY: "auto",
  "&::-webkit-scrollbar": {
    width: "12px",
  },
  "&::-webkit-scrollbar-thumb": {
    backgroundColor: "#888",
  },
  "&::-webkit-scrollbar-track": {
    backgroundColor: "#f1f1f1",
  },
};

const style2 = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  bgcolor: "white",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
  borderRadius: "12px",
};

function HomePage() {
  const [plateID, setPlateID] = useState("");
  const [isSubscribe, setIsSubscribe] = useState(false);
  const [plateNumber, setPlateNumber] = useState("");
  const [logData, setLogData] = useState<LogData[]>([]);
  const [openHistory, setOpenHistory] = useState(false);
  const [openBalance, setOpenBalance] = useState(false);
  const [balance, setBalance] = useState(0);
  const [topUpAmount, setTopUpAmount] = useState(0);
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

  const handleCloseHistory = () => setOpenHistory(false);
  const handleCloseBalance = () => setOpenBalance(false);

  const instance = axios.create({
    baseURL: "http://localhost:4444/", // Replace with your API base UR
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
    formData.append("plate_number", plateNumber.toUpperCase());

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

  const getBalance = () => {
    checkAndRenewToken(renewTokenParam, setCookie).then(() => {
      instance
        .get("/wallet/balance", {
          headers: {
            Authorization: `Bearer ${cookies.accessToken}`,
          },
        })
        .then((response) => {
          if (response.status == 200) {
            const balance = response.data;
            setBalance(balance);
            console.log(balance);
            setOpenBalance(true);
          }
        })
        .catch((err) => {
          console.log(err);
        });
    });
  };

  const handleTopUp = () => {
    const formData = new URLSearchParams();
    formData.append("amount", "" + topUpAmount);

    checkAndRenewToken(renewTokenParam, setCookie).then(() => {
      instance
        .post("http://localhost:4444/wallet/topUp", formData, {
          headers: {
            Authorization: `Bearer ${cookies.accessToken}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
        })
        .then((response) => {
          if (response.status == HttpStatusCode.Ok) {
            setOpenBalance(false);
            setTopUpAmount(0);
            setBalance(response.data + balance);
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
    });
  };

  const handleDownload = () => {
    checkAndRenewToken(renewTokenParam, setCookie).then(() => {
      instance
        .get("http://localhost:4444/download/files", {
          headers: {
            Authorization: `Bearer ${cookies.accessToken}`,
          },
          responseType: "blob",
        })
        .then((response) => {

          if (response.status != HttpStatusCode.Ok) return
          // Create a Blob from the binary data
          const blob = new Blob([response.data], {
            type: response.headers["content-type"],
          });

          // Create a link element to trigger the download
          const link = document.createElement("a");
          link.href = window.URL.createObjectURL(blob);
          link.download = "manual.pdf"; // Specify the desired filename

          // Trigger a click on the link to start the download
          document.body.appendChild(link);
          link.click();

          // Remove the link element from the DOM
          document.body.removeChild(link);
        })
        .catch((err) => {
          if (axios.isAxiosError(err)) {
            const axiosErr = err as AxiosError;
            const errorMessage = axiosErr.response?.data;
            handleShowWarning(`An error occurred: ${errorMessage}`);
          }
        });
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
            setOpenHistory(true);
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
          <div className="flex items-center justify-center">
            <div className="mr-2 justify-center">
              <Money />
            </div>
            <button
              className="w-36 hover:border-green-600"
              onClick={getBalance}
            >
              See Balance
            </button>
          </div>
        </div>
      )}
      <div className="flex items-center justify-center">
        <div className="mr-2 justify-center">
          <DataArrayIcon />
        </div>
        <button className="w-36 hover:border-yellow-600" onClick={getHistory}>
          See History
        </button>
      </div>
      <div className="flex items-center justify-center">
        <div className="mr-1 justify-center">
          <DownloadRounded />
        </div>
        <button className="w-36 hover:border-red-600" onClick={handleDownload}>
          Download Manual
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
          open={openHistory}
          onClose={handleCloseHistory}
          closeAfterTransition
          BackdropComponent={Backdrop}
          BackdropProps={{
            timeout: 500,
          }}
        >
          <Fade in={openHistory}>
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
      <div>
        <Modal
          aria-labelledby="transition-modal-title"
          aria-describedby="transition-modal-description"
          open={openBalance}
          onClose={handleCloseBalance}
          closeAfterTransition
          BackdropComponent={Backdrop}
          BackdropProps={{
            timeout: 500,
          }}
        >
          <Fade in={openBalance}>
            <Box sx={style2}>
              <p className="text-black mb-4">
                Current Balance: <strong>IDR {balance}</strong>
              </p>
              <TextField
                label="Top-up Amount"
                variant="outlined"
                inputMode="decimal"
                value={topUpAmount}
                onChange={(e) => setTopUpAmount(parseInt(e.target.value, 10))}
                fullWidth
                margin="normal"
              />
              <Button variant="contained" color="success" onClick={handleTopUp}>
                Top Up
              </Button>
            </Box>
          </Fade>
        </Modal>
      </div>
    </div>
  );
}

export default HomePage;
