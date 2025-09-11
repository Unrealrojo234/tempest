function Confirm(message) {
	Swal.fire({
		title: message,
		showDenyButton: true,
		showCancelButton: true,
		denyButtonText: `Delete`
	}).then((result) => {
		if (result.isDenied) {
			return true;
		}
	});
}


export default Confirm;