const { giai_ma_request } = require("./");

// Thay bằng dữ liệu thực tế bạn được phép kiểm tra
const aMaHoa =
  "P3EgVzY7Ji1pbnMqCSoeJz8RMB4VDnx/DjkQQQkTHHMHLQgMBzoUJg47FEQIEX0TAT4AHA84FEYGEQwVCQBhAGhGcxM+LzYSdlspDiQcNjgxPSZrLjMwNyM7Pw4wEC8HPxEwHmQPVSkOORIdPiIbUSIeDQ0mLBs3MTwocDc8LhwCMHNFZhAMVHBKFAowEE0jPg88V2djJkQ+Nz4QLCoRJSo0Hn0mcHNheWRgWgJKdjIJX2ExfgAFaAspaE1/dWRzCjtgUHJ6bWdmf2NHNiAcLSwQJAcjJggSaFJ3SHoAcmkPW2c2eQViBApNbyRyBhYVc2ADAwFjeHoKbBdLaFsyAjgrPQUpDVU+LTUYEWl7dxJgWyoRMQ0yJSs6FVw3MQEqLjoOICBbe1R4WGRDDHADFAldZTR/AmQIDTpgXXd3ZBMCEXgBc2txdGkp";
const suffixHoacAction = "suffix";

try {
  const result = giai_ma_request(aMaHoa, suffixHoacAction);

  console.log("Dữ liệu sau giải mã:");
  console.dir(result, { depth: null });
} catch (error) {
  console.error("Không giải mã được:", error.message);
}
