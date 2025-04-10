import React from "react";

const Row = ({ row }) => {
  return (
    <div className="flex">
      <div className="border px-4 py-2 text-nowrap truncate flex items-center w-3/4" onClick={() => window.open(row.url, "_blank")}>
        {row.icon_url && (
          <img className="w-[20px] h-[20px] inline mr-4" src={row.icon_url} alt="" />
        )}
        <div className="overflow-hidden truncate">
          <p>{row.title}</p>
          <a href={row.url} className="text-blue-600 hover:underline cursor-pointer">{row.url}</a>
        </div>
      </div>
      <div className="border px-4 py-2 whitespace-pre-line w-1/4">{row.time}</div>
    </div>
  );
};

export default Row;
