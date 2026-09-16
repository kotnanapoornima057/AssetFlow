import { QRCodeCanvas } from "qrcode.react";
import html2canvas from "html2canvas";
import {
  FaDownload,
  FaPrint,
  FaTimes,
  FaCopy,
  FaMapMarkerAlt,
  FaTag,
} from "react-icons/fa";
import toast from "react-hot-toast";

function AssetQRCode({ asset, onClose }) {
  if (!asset) return null;

  const assetURL = `${window.location.origin}/assets/${asset.asset_id}`;

  const downloadQR = async () => {
    const qrCard = document.getElementById("qr-card");

    const canvas = await html2canvas(qrCard, {
      scale: 2,
      backgroundColor: "#ffffff",
    });

    const link = document.createElement("a");
    link.download = `${asset.asset_tag}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();

    toast.success("QR downloaded");
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(assetURL);
    toast.success("Link copied");
  };

  const printQR = () => {
    const content = document.getElementById("qr-card").innerHTML;

    const win = window.open("", "", "width=700,height=700");

    win.document.write(`
      <html>
      <head>
        <title>${asset.asset_tag}</title>
        <style>
          body{
            font-family:Arial;
            display:flex;
            justify-content:center;
            align-items:center;
            height:100vh;
            margin:0;
            background:#fff;
          }
        </style>
      </head>
      <body>
        ${content}
      </body>
      </html>
    `);

    win.document.close();
    win.focus();
    win.print();
    win.close();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">

      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate__animated animate__zoomIn">

        {/* Header */}

        <div className="flex items-center justify-between px-6 py-5 border-b">

          <div>
            <h2 className="text-3xl font-bold text-blue-700">
              AssetFlow
            </h2>

            <p className="text-slate-500">
              Enterprise Asset QR
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-2xl text-slate-500 hover:text-red-600 transition"
          >
            <FaTimes />
          </button>

        </div>

        {/* QR CARD */}

        <div
          id="qr-card"
          className="bg-white text-slate-900 px-6 py-6 text-center"
        >

          <div className="flex justify-center">
            <QRCodeCanvas
              value={assetURL}
              size={190}
              includeMargin
            />
          </div>

          {/* Asset Tag */}

          <h3 className="mt-5 text-3xl font-bold text-slate-900">
            {asset.asset_tag}
          </h3>

          {/* Asset Name */}

          <p className="mt-2 text-lg font-semibold text-slate-700">
            {asset.asset_name}
          </p>

          {/* Location */}

          <div className="mt-6 space-y-4">

            <div className="flex items-center gap-3 bg-slate-100 rounded-xl px-4 py-3">

              <FaMapMarkerAlt className="text-green-600 text-xl" />

              <span className="text-slate-900 font-semibold">
                {asset.location || "Not Assigned"}
              </span>

            </div>

            {/* Status */}

            <div className="flex items-center gap-3 bg-slate-100 rounded-xl px-4 py-3">

              <FaTag className="text-orange-500 text-xl" />

              <span
                className={`font-semibold ${
                  asset.status === "Available"
                    ? "text-green-700"
                    : asset.status === "Allocated"
                    ? "text-blue-700"
                    : asset.status === "Booked"
                    ? "text-yellow-700"
                    : asset.status === "Maintenance"
                    ? "text-orange-700"
                    : asset.status === "Lost"
                    ? "text-red-700"
                    : "text-slate-700"
                }`}
              >
                {asset.status}
              </span>

            </div>

          </div>

        </div>

        {/* Footer */}

        <div className="grid grid-cols-2 gap-3 p-5 border-t">

          <button
            onClick={downloadQR}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-3 font-semibold flex items-center justify-center gap-2 transition"
          >
            <FaDownload />
            Download
          </button>

          <button
            onClick={printQR}
            className="bg-green-600 hover:bg-green-700 text-white rounded-xl py-3 font-semibold flex items-center justify-center gap-2 transition"
          >
            <FaPrint />
            Print
          </button>

          <button
            onClick={copyLink}
            className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl py-3 font-semibold flex items-center justify-center gap-2 transition"
          >
            <FaCopy />
            Copy Link
          </button>

          <button
            onClick={onClose}
            className="bg-slate-600 hover:bg-slate-700 text-white rounded-xl py-3 font-semibold flex items-center justify-center gap-2 transition"
          >
            <FaTimes />
            Close
          </button>

        </div>

      </div>

    </div>
  );
}

export default AssetQRCode;