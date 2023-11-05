import axios, { AxiosError, HttpStatusCode } from "axios";
import { useState, useEffect } from "react";
import { useCookies } from "react-cookie";
import checkAndRenewToken from "../../utils/renewToken";
import { generateInoContent } from "../../static/inoGenerator";
import Popup from "../popup";

function HomePage() {
  const [plateID, setPlateID] = useState("");
  const [isSubscribe, setIsSubscribe] = useState(false);
  const [plateNumber, setPlateNumber] = useState("");
  const [logData, setLogData] = useState<LogData[]>([]);
  const [registerPlateSuccess, setRegisterPlate] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
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

  const instance = axios.create({
    baseURL: "http://localhost:4444/", // Replace with your API base UR
  });

  useEffect(() => {
    checkAndRenewToken(renewTokenParam, setCookie).then(getID);
    // setInterval(getHistory, 2000);
  }, [,registerPlateSuccess]);

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
    setErrorMessage('');
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
      }).catch((err) => {
        if (axios.isAxiosError(err)) {
          const axiosErr = err as AxiosError
          const errorMessage = axiosErr.response?.data;
          handleShowWarning(`An error occurred: ${errorMessage}`);
        }
      });
  };

  const handleDownload = () => {
    const modifiedInoContent = generateInoContent("Hello"); 

    // Create a Blob with the modified content
    const blob = new Blob([modifiedInoContent], { type: "text/plain" });

    // Create an object URL from the Blob
    const objectURL = URL.createObjectURL(blob);

    // Create an invisible <a> element and trigger a click event to download the file
    const a = document.createElement("a");
    a.href = objectURL;
    a.download = "modified_example.ino"; // Specify the desired file name
    document.body.appendChild(a);
    a.click();

    // Cleanup by removing the <a> element and revoking the object URL
    document.body.removeChild(a);
    URL.revokeObjectURL(objectURL);
  };

  const getHistory = () => {
    const params = {
      account_id: cookies.userID,
    };

    checkAndRenewToken(renewTokenParam, setCookie).then(() => {
      instance.get("/logs", {
        params,
        headers: {
          Authorization: `Bearer ${cookies.accessToken}`,
        },
      }).then((response)=>{
        const data = response.data as LogData[];
        setLogData(data);
        console.log(data)
      })
    })
  } 

  return (
    <div>
      {!plateID ? (
        <div>
          <input
            type="text"
            placeholder="Enter Plate Number"
            value={plateNumber}
            onChange={(e) => setPlateNumber(e.target.value)}
          />
          <button onClick={handleRegister}>Register Plate</button>
        </div>
      ) : (
        <div>
          <p>Plate ID: {plateID}</p>
          <p>Subscription status : {isSubscribe ? "Sudah" : "Belum"}</p>
        </div>
      )}
      <div>
        <button onClick={handleLogout}>Log Out</button>
      </div>
      <div>
        <button onClick={handleDownload}>Download .ino File</button>
      </div>
      {showWarning && (
        <Popup message={errorMessage} onClose={handleCloseWarning} />
      )}
      <div>
        <button onClick={getHistory}>SEE LOG</button>
      </div>
      <h4>Log Data</h4>
      <table>
        <thead>
          <tr>
            <th>Event ID</th>
            <th>Location</th>
            <th>Transaction Time</th>
          </tr>
        </thead>
        <tbody>
          {logData.map((entry, index) => (
            <tr key={index}>
              <td>{entry.event_id}</td>
              <td>{entry.location.String}</td>
              <td>{entry.transaction_time.Time}</td>
            </tr>
          ))}
        </tbody>
      </table>

    </div>
  );
}

export default HomePage;
