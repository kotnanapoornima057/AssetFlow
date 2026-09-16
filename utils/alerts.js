import Swal from "sweetalert2";

export const confirmDelete = async (item = "item") => {
  return await Swal.fire({
    title: `Delete ${item}?`,
    html: `
      <p style="font-size:15px;color:#6b7280">
      This action cannot be undone.
      </p>
    `,
    icon: "warning",

    showCancelButton: true,

    confirmButtonText: "Delete",

    cancelButtonText: "Cancel",

    reverseButtons: true,

    buttonsStyling:false,

    confirmButtonColor:"#1d4ed8",
    cancelButtonColor:"#64748b",

    customClass:{
    popup:"animate__animated animate__zoomIn rounded-2xl",

    confirmButton:
        "bg-blue-700 hover:bg-blue-800 text-white rounded-lg px-5 py-2 mx-2",

    cancelButton:
        "bg-gray-300 hover:bg-gray-400 rounded-lg px-5 py-2 mx-2"
},
  });
};

export const successAlert = (title) =>
  Swal.fire({
    icon: "success",
    title,
    timer: 1700,
    showConfirmButton: false,
    customClass: {
      popup: "rounded-2xl",
    },
  });

export const errorAlert = (message) =>
  Swal.fire({
    icon: "error",
    title: "Error",
    text: message,
    customClass:{
    popup:"animate__animated animate__zoomIn rounded-2xl"
},
  });