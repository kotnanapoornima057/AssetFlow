import { QRCodeCanvas } from "qrcode.react";

function QRCodeCard({
  assetTag,
}) {
  const url =
    `${window.location.origin}/assets/${assetTag}`;

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center">

      <QRCodeCanvas
        value={url}
        size={170}
        includeMargin
      />

      <h3 className="mt-5 font-bold text-lg">
        {assetTag}
      </h3>

      <p className="text-gray-500 text-sm">
        Scan to view asset
      </p>

    </div>
  );
}

export default QRCodeCard;