import Snackbar from "@mui/material/Snackbar";

export default function MySnack({alive, handleClose, message}) {


 return(<>
    <Snackbar
        open={alive}
        color="danger"
        autoHideDuration={2000}
        onClose={handleClose}
        message={message}
      />
 </>);
}
