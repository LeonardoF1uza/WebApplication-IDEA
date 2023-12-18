import { Chart } from "react-google-charts";
import { ReactComponent as LogoSvg } from './components/logo.svg';
import { FaMedal } from "react-icons/fa";
import "./App.css";
import {
  AirIcon,
  EnergyIcon,
  MovementIcon,
  RecycleIcon,
  WaterIcon,
} from "./components/areas_icons";
import * as CONST from "./styling/constants.js";
import { useEffect, useState } from "react";
import {
  FaWind,
  FaRecycle,
  FaFaucet,
  FaWalking,
  FaBolt,
  FaArrowDown,
  FaArrowUp,
  FaEquals,
} from "react-icons/fa";
import "./assets/fonts/K2D-Regular.ttf";
import "./assets/fonts/K2D-Medium.ttf";
import db from "./firebase";
import { collection, getDocs} from "firebase/firestore";

function getLastSevenDays() {
  const dates = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    dates.push(formatDate(date));
  }
  return dates;
}

function getSevenDaysBefore() {
  const dates = [];
  const today = new Date();
  for (let i = 13; i >= 7; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    dates.push(formatDate(date));
  }
  return dates;
}

function formatDate(date) {
  const day = String(date.getDate());
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}
function formatDate2(data) {
  const [d, m, a] = data.split("-").map(Number);

  const dF = d.toString().replace(/^0+/, "");

  //const mF = m.toString().replace(/^0+/, "");
  //const aF = a;

  const mF = new Date().getMonth() + 1;
  const aF = new Date().getUTCFullYear();

  return `${dF}/${mF}/${aF}`;
}
function totalRingPoints(p) {
  const val = p.slice(1).map(item => item[1]);
  const total = val.reduce((acc, valor) => acc + valor, 0);
  return total;
}

function ringPointsPerCategory(p, area) {
  const aux = p.find(item => item[0] === area);
  return aux ? aux[1] : null;
}


function App() {
  const orgID = "nM1DSA35wQKvGqmktpTD";
  const [category, setCategory] = useState("climatização");
  const [categoryPoints, setCategoryPoints] = useState();
  const [categoryPointsBefore, setCategoryPointsBefore] = useState();
  const [firstWeekPoints, setFirstWeekPoints] = useState({
    air: {},
    energy: {},
    movement: {},
    recycle: {},
    water: {},
  }); // total of points per category
  const [secondWeekPoints, setSecondWeekPoints] = useState({
    air: {},
    energy: {},
    movement: {},
    recycle: {},
    water: {},
  }); // total of points per category
  const [orgName, setOrgName] = useState(0);
  const [scorePerCategories, setScorePerCategories] = useState({
    air: {},
    energy: {},
    movement: {},
    recycle: {},
    water: {},
  });

  const [loadPage, setLoadpage] = useState(0);
  const [loadArea, setLoadArea] = useState(0);

  const [dataLine, setDataLine] = useState([]);

  const [dataRing, setDataRing] = useState([]);
  const [msg1, setMsg1] = useState("");
  const [msg2, setMsg2] = useState("");

  const [area, setArea] = useState("water");
  const [window, setWindow] = useState("second");
  const [dataSensor, setDataSensor] = useState({});


  const rankingColors = {
    air: [
      CONST.softPurple,
      CONST.purple,
      CONST.grayishPurple,
      CONST.darkPurple,
    ],
    energy: [
      CONST.softYellow,
      CONST.yellow,
      CONST.grayishYellow,
      CONST.darkYellow,
    ],
    movement: [CONST.softPink, CONST.pink, CONST.grayishPink, CONST.darkPink],
    recycle: [
      CONST.softGreen,
      CONST.green,
      CONST.grayishGreen,
      CONST.darkGreen,
    ],
    water: [CONST.softBlue, CONST.blue, CONST.grayishBlue, CONST.darkBlue],
  };

  const optionsLine = {
    //curveType: "function",
    is3D: false,
    textColor: "#fff",
    backgroundColor: "transparent",

    legend: {
      position: "right",
      textStyle: {
        color: "#fff",
        fontFamily: "K2D-Regular",
      },
      spacing: 200,
    },

    series: {
      0: {
        labelInLegend: "Semana Atual",
        color: rankingColors[area][0],
        lineWidth: 4,
      },
      1: {
        labelInLegend: "Semana Anterior",
        color: rankingColors[area][3],
        lineWidth: 4,
      },
    },
    vAxis: {
      textStyle: {
        color: "white",
        fontFamily: "K2D-Regular",
      },
      minValue: 0,
      gridlines: {
        color: "transparent",
      },
    },
    hAxis: {
      textStyle: {
        color: "white",
        fontFamily: "K2D-Regular",
      },
      minValue: 0,
      gridlines: {
        color: "transparent",
        fontFamily: "K2D-Regular",
      },
    },
    chartArea: {
      backgroundColor: "transparent",
    },
  };

  const optionsLine2 = {
    //curveType: "function",
    is3D: false,
    textColor: "fff",
    backgroundColor: "transparent",

    legend: {
      position: "right",
      textStyle: { color: "#fff" },
      spacing: 200,
      fontFamily: "K2D-Regular",
    },

    annotations: {
      textStyle: {
        fontSize: 12,
        color: "#000",
      },
    },

    series: {
      0: {
        labelInLegend: "Nº de utilizações",
        color: rankingColors[area][0],
        lineWidth: 4,
      },
      1: {
        labelInLegend: " ",
        color: "transparent",
        lineWidth: 4,
      },
    },
    vAxis: {
      textStyle: { color: "white" },
      minValue: 0,
      gridlines: {
        color: "transparent",
        fontFamily: "K2D-Regular",
      },
    },
    hAxis: {
      textStyle: { color: "white" },
      gridlines: {
        color: "white",
        count: 5,
        fontFamily: "K2D-Regular",
      },
    },

    chartArea: {
      backgroundColor: "transparent",
    },
  };

  const configPieChart = {
    pieHole: 0.6,
    is3D: false,
    legend: "none",
    legendtoggle: "false",
    pieSliceText: "none",
    backgroundColor: "transparent",
    chartArea: {
      backgroundColor: "transparent",
    },

    slices: {
      0: {
        color: area === "air" ? CONST.purple : CONST.mainGray,
        borderColor: "000",
      },
      1: {
        color: area === "energy" ? CONST.yellow : CONST.mainGray,
        borderColor: "000",
      },
      2: {
        color: area === "movement" ? CONST.pink : CONST.mainGray,
        borderColor: "000",
      },
      3: {
        color: area === "recycle" ? CONST.green : CONST.mainGray,
        borderColor: "000",
      },
      4: {
        color: area === "water" ? CONST.blue : CONST.mainGray,
        borderColor: "000",
      },
    },
    pieSliceBorderColor: CONST.secondaryGray,
  };
  const optionsRing = configPieChart;

  const checkContains = (day, origin) => {
    return Object.keys(origin).includes(day) ? origin[day] : 0;
  };

  let sevenDaysTemp = getLastSevenDays();
  let sevenDaysBeforeTemp = getSevenDaysBefore();
  const [flag, setFlag] = useState(0);
  const [initialFlag, setinitialFlag] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      const newDataSensor = {};

      const sensorSnapshot = await getDocs(collection(db, "sensor"));

      const sensorData = sensorSnapshot.docs.map((doc) => {
        return {
          id: doc.id,
          ...doc.data(),
        };
      });

      let days = getLastSevenDays();

      for (let index = 0; index < days.length; index++) {
        newDataSensor[days[index]] = {
          StartTime: "00:00:00",
          Exits: 0,
          Enters: 0,
          EndTime: "23:50:00",
        };
      }

      for (let cont = 0; cont < sensorData.length; cont++) {

        if (days.includes(formatDate2(sensorData[cont].id))) {
          let { id, ...dataWithoutId } = sensorData[cont];
          id = formatDate2(id)
          for (let c in dataWithoutId) {

            if (c.endsWith("Exits")) {
              newDataSensor[id]["Exits"] = newDataSensor[id]["Exits"] + dataWithoutId[c];
            } else if (c.endsWith("Enters")) {
              newDataSensor[id]["Enters"] = newDataSensor[id]["Enters"] + dataWithoutId[c];
            }
          }
        }
      }
      setDataSensor(newDataSensor);

    };

      fetchData();

  },[flag]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setFlag((prevFlag) => (prevFlag === 0 ? 1 : 0));
    }, 24 * 60 * 60 * 1000);
    return () => clearInterval(intervalId);
  }, [initialFlag]);



  useEffect(() => {
    const interval = setInterval(() => {
      if (initialFlag === 0) {
        setinitialFlag(1);
        LineChartUdate()
        
      }

      if (area !== "movement") {
        if (loadPage === 0) {
          setLoadpage(1);
        } else {
          setLoadpage(0);
          setLoadArea(loadArea + 1);
        }
      } else {
        if (loadPage === 0) {
          setLoadpage(1);
        } else if (loadPage === 1) {
          setLoadpage(2);
        } else {
          setLoadpage(0);
          setLoadArea(0);
        }
      }
    }, [5000]);

    return () => clearInterval(interval);
  }, [loadPage, loadArea]);

  useEffect(() => {
    LineChartSensorUdate();
  }, [dataSensor]);

  useEffect(() => {
    const fetchData = async () => {
      const departmentsSnapshot = await getDocs(collection(db, "departments"));
      const departmentsData = departmentsSnapshot.docs.map((doc) => doc.data());

      const orgSnapshot = await getDocs(collection(db, "organizations"));
      const orgData = orgSnapshot.docs.map((doc) => doc.data());

      setOrgName(orgData.find((entry) => entry.uid === orgID).name);

      sevenDaysTemp = getLastSevenDays();
      sevenDaysBeforeTemp = getSevenDaysBefore();

      let updatedFirstWeekPoints = firstWeekPoints;
      let updatedSecondWeekPoints = secondWeekPoints;
      let updatedScorePerCategories = scorePerCategories;

      for (let i = 0; i < departmentsData.length; i++) {
        if (orgID === departmentsData[i].organization) {
          let dep = departmentsData[i];
          for (let day of sevenDaysTemp) {
            let points_air = checkContains(day, dep.air_points);
            updatedFirstWeekPoints.air[day] =
              (updatedFirstWeekPoints.air[day] || 0) + points_air;
            updatedScorePerCategories.air[dep.name] =
              (updatedScorePerCategories.air[dep.name] || 0) + points_air;

            let points_energy = checkContains(day, dep.energy_points);
            updatedFirstWeekPoints.energy[day] =
              (updatedFirstWeekPoints.energy[day] || 0) + points_energy;
            updatedScorePerCategories.energy[dep.name] =
              (updatedScorePerCategories.energy[dep.name] || 0) + points_energy;

            let points_movement = checkContains(day, dep.movement_points);
            updatedFirstWeekPoints.movement[day] =
              (updatedFirstWeekPoints.movement[day] || 0) + points_movement;
            updatedScorePerCategories.movement[dep.name] =
              (updatedScorePerCategories.movement[dep.name] || 0) +
              points_movement;

            let points_recycle = checkContains(day, dep.recycle_points);
            updatedFirstWeekPoints.recycle[day] =
              (updatedFirstWeekPoints.recycle[day] || 0) + points_recycle;
            updatedScorePerCategories.recycle[dep.name] =
              (updatedScorePerCategories.recycle[dep.name] || 0) +
              points_recycle;

            let points_water = checkContains(day, dep.water_points);
            updatedFirstWeekPoints.water[day] =
              (updatedFirstWeekPoints.water[day] || 0) + points_water;
            updatedScorePerCategories.water[dep.name] =
              (updatedScorePerCategories.water[dep.name] || 0) + points_water;
          }
          setScorePerCategories(updatedScorePerCategories);
          for (let day of sevenDaysBeforeTemp) {
            updatedSecondWeekPoints.air[day] =
              (updatedSecondWeekPoints.air[day] || 0) +
              checkContains(day, dep.air_points);
            updatedSecondWeekPoints.energy[day] =
              (updatedSecondWeekPoints.energy[day] || 0) +
              checkContains(day, dep.energy_points);
            updatedSecondWeekPoints.movement[day] =
              (updatedSecondWeekPoints.movement[day] || 0) +
              checkContains(day, dep.movement_points);
            updatedSecondWeekPoints.recycle[day] =
              (updatedSecondWeekPoints.recycle[day] || 0) +
              checkContains(day, dep.recycle_points);
            updatedSecondWeekPoints.water[day] =
              (updatedSecondWeekPoints.water[day] || 0) +
              checkContains(day, dep.water_points);
          }
        }
      }

      Object.keys(updatedFirstWeekPoints.air).forEach((key) => {
        updatedFirstWeekPoints.air[key] /= departmentsData.length;
      });
      Object.keys(updatedFirstWeekPoints.energy).forEach((key) => {
        updatedFirstWeekPoints.energy[key] /= departmentsData.length;
      });
      Object.keys(updatedFirstWeekPoints.movement).forEach((key) => {
        updatedFirstWeekPoints.movement[key] /= departmentsData.length;
      });
      Object.keys(updatedFirstWeekPoints.recycle).forEach((key) => {
        updatedFirstWeekPoints.recycle[key] /= departmentsData.length;
      });
      Object.keys(updatedFirstWeekPoints.water).forEach((key) => {
        updatedFirstWeekPoints.water[key] /= departmentsData.length;
      });

      Object.keys(updatedSecondWeekPoints.air).forEach((key) => {
        updatedSecondWeekPoints.air[key] /= departmentsData.length;
      });
      Object.keys(updatedSecondWeekPoints.energy).forEach((key) => {
        updatedSecondWeekPoints.energy[key] /= departmentsData.length;
      });
      Object.keys(updatedSecondWeekPoints.movement).forEach((key) => {
        updatedSecondWeekPoints.movement[key] /= departmentsData.length;
      });
      Object.keys(updatedSecondWeekPoints.recycle).forEach((key) => {
        updatedSecondWeekPoints.recycle[key] /= departmentsData.length;
      });
      Object.keys(updatedSecondWeekPoints.water).forEach((key) => {
        updatedSecondWeekPoints.water[key] /= departmentsData.length;
      });

      setFirstWeekPoints(updatedFirstWeekPoints);
      setSecondWeekPoints(updatedSecondWeekPoints);

      setCategoryPoints(
        Object.values(updatedFirstWeekPoints.air).reduce(
          (acc, curr) => acc + curr,
          0
        ) / Object.values(updatedFirstWeekPoints.air).length
      );
      setCategoryPointsBefore(
        Object.values(updatedSecondWeekPoints.air).reduce(
          (acc, curr) => acc + curr,
          0
        ) / Object.values(updatedSecondWeekPoints.air).length
      );

      setDataRing([
        ["catgories", "points"],
        [
          "air",
          Object.values(updatedFirstWeekPoints.air).reduce(
            (acc, curr) => acc + curr,
            0
          ) / Object.values(updatedFirstWeekPoints.air).length,
        ],
        [
          "energy",
          Object.values(updatedFirstWeekPoints.energy).reduce(
            (acc, curr) => acc + curr,
            0
          ) / Object.values(updatedFirstWeekPoints.energy).length,
        ],
        [
          "movement",
          Object.values(updatedFirstWeekPoints.movement).reduce(
            (acc, curr) => acc + curr,
            0
          ) / Object.values(updatedFirstWeekPoints.movement).length,
        ],
        [
          "recycle",
          Object.values(updatedFirstWeekPoints.recycle).reduce(
            (acc, curr) => acc + curr,
            0
          ) / Object.values(updatedFirstWeekPoints.recycle).length,
        ],
        [
          "water",
          Object.values(updatedFirstWeekPoints.water).reduce(
            (acc, curr) => acc + curr,
            0
          ) / Object.values(updatedFirstWeekPoints.water).length,
        ],
      ]);


        
    };

    LineChartUdate();

    fetchData();
 
  }, []);




  

  useEffect(() => {}, [
    firstWeekPoints,
    secondWeekPoints,
    category,
    categoryPoints,
  ]);

  useEffect(() => {
    LineChartUdate();
  }, [area]);

  const [dataSensorChart, setDataSensorChart] = useState();

  function LineChartSensorUdate() {
    let keys = Object.keys(dataSensor);

    setDataSensorChart([
      ["---", "Semana passada", "Esta Semana"],
      [
        keys[0],
        (dataSensor[keys[0]]?.["Enters"] || 0) +
          (dataSensor[keys[0]]?.["Exits"] || 0),
        (dataSensor[keys[0]]?.["Enters"] || 0) +
          (dataSensor[keys[0]]?.["Exits"] || 0),
      ],
      [
        keys[1],
        (dataSensor[keys[1]]?.["Enters"] || 0) +
          (dataSensor[keys[1]]?.["Exits"] || 0),
        (dataSensor[keys[1]]?.["Enters"] || 0) +
          (dataSensor[keys[1]]?.["Exits"] || 0),
      ],
      [
        keys[2],
        (dataSensor[keys[2]]?.["Enters"] || 0) +
          (dataSensor[keys[2]]?.["Exits"] || 0),
        (dataSensor[keys[2]]?.["Enters"] || 0) +
          (dataSensor[keys[2]]?.["Exits"] || 0),
      ],
      [
        keys[3],
        (dataSensor[keys[3]]?.["Enters"] || 0) +
          (dataSensor[keys[3]]?.["Exits"] || 0),
        (dataSensor[keys[3]]?.["Enters"] || 0) +
          (dataSensor[keys[3]]?.["Exits"] || 0),
      ],
      [
        keys[4],
        (dataSensor[keys[4]]?.["Enters"] || 0) +
          (dataSensor[keys[4]]?.["Exits"] || 0),
        (dataSensor[keys[4]]?.["Enters"] || 0) +
          (dataSensor[keys[4]]?.["Exits"] || 0),
      ],
      [
        keys[5],
        (dataSensor[keys[5]]?.["Enters"] || 0) +
          (dataSensor[keys[5]]?.["Exits"] || 0),
        (dataSensor[keys[5]]?.["Enters"] || 0) +
          (dataSensor[keys[5]]?.["Exits"] || 0),
      ],
      [
        keys[6],
        (dataSensor[keys[6]]?.["Enters"] || 0) +
          (dataSensor[keys[6]]?.["Exits"] || 0),
        (dataSensor[keys[6]]?.["Enters"] || 0) +
          (dataSensor[keys[6]]?.["Exits"] || 0),
      ],
    ]);
  }

  function LineChartUdate() {
    setDataLine([
      ["---", "Semana passada", "Esta Semana"],
      [
        sevenDaysTemp[0] + "\nvs\n" + sevenDaysBeforeTemp[0],
        firstWeekPoints[area][sevenDaysTemp[0]],
        secondWeekPoints[area][sevenDaysBeforeTemp[0]],
      ],
      [
        sevenDaysTemp[1] + "\nvs\n" + sevenDaysBeforeTemp[1],
        firstWeekPoints[area][sevenDaysTemp[1]],
        secondWeekPoints[area][sevenDaysBeforeTemp[1]],
      ],
      [
        sevenDaysTemp[2] + "\nvs\n" + sevenDaysBeforeTemp[2],
        firstWeekPoints[area][sevenDaysTemp[2]],
        secondWeekPoints[area][sevenDaysBeforeTemp[2]],
      ],
      [
        sevenDaysTemp[3] + "\nvs\n" + sevenDaysBeforeTemp[3],
        firstWeekPoints[area][sevenDaysTemp[3]],
        secondWeekPoints[area][sevenDaysBeforeTemp[3]],
      ],
      [
        sevenDaysTemp[4] + "\nvs\n" + sevenDaysBeforeTemp[4],
        firstWeekPoints[area][sevenDaysTemp[4]],
        secondWeekPoints[area][sevenDaysBeforeTemp[4]],
      ],
      [
        sevenDaysTemp[5] + "\nvs\n" + sevenDaysBeforeTemp[5],
        firstWeekPoints[area][sevenDaysTemp[5]],
        secondWeekPoints[area][sevenDaysBeforeTemp[5]],
      ],
      [
        sevenDaysTemp[6] + "\nvs\n" + sevenDaysBeforeTemp[6],
        firstWeekPoints[area][sevenDaysTemp[6]],
        secondWeekPoints[area][sevenDaysBeforeTemp[6]],
      ],
    ]);
  }

  function verificarMessage(n) {
    if (n > 0) {
      setMsg1("Conseguimos melhorar!");
      setMsg2("O nosso desempenho subiu em:");
    } else if (n < 0) {
      setMsg1("Temos de melhorar!");
      setMsg2("Piorámos o nosso consumo em:");
    } else {
      setMsg1("Está estável o nosso consumo.");
      setMsg2("mantivemos o nosso cosnsumo");
    }
  }

  useEffect(() => {
    switch (window) {
      case "first":
        setWindow("second");
        break;
      case "second":
        if (area === "movement") {
          setWindow("third");
        } else {
          setWindow("first");
        }
        break;
      case "third":
        setWindow("first");
        break;
    }
  }, [loadPage]);

  useEffect(() => {
    verificarMessage(Math.round(categoryPoints - categoryPointsBefore));
  }, [categoryPoints, categoryPointsBefore]);

  useEffect(() => {
    switch (area) {
      case "air":
        setArea("energy");
        setCategory("energia elétrica");
        setCategoryPoints(
          Object.values(firstWeekPoints.energy).reduce(
            (acc, curr) => acc + curr,
            0
          ) / Object.values(firstWeekPoints.energy).length
        );
        setCategoryPointsBefore(
          Object.values(secondWeekPoints.energy).reduce(
            (acc, curr) => acc + curr,
            0
          ) / Object.values(secondWeekPoints.energy).length
        );

        break;
      case "energy":
        setArea("movement");
        setCategory("mobilidade");
        setCategoryPoints(
          Object.values(firstWeekPoints.movement).reduce(
            (acc, curr) => acc + curr,
            0
          ) / Object.values(firstWeekPoints.movement).length
        );
        setCategoryPointsBefore(
          Object.values(secondWeekPoints.movement).reduce(
            (acc, curr) => acc + curr,
            0
          ) / Object.values(secondWeekPoints.movement).length
        );

        break;
      case "movement":
        setArea("recycle");
        setCategory("reciclagem");
        setCategoryPoints(
          Object.values(firstWeekPoints.recycle).reduce(
            (acc, curr) => acc + curr,
            0
          ) / Object.values(firstWeekPoints.recycle).length
        );
        setCategoryPointsBefore(
          Object.values(secondWeekPoints.recycle).reduce(
            (acc, curr) => acc + curr,
            0
          ) / Object.values(secondWeekPoints.recycle).length
        );

        break;
      case "recycle":
        setArea("water");
        setCategory("recursos hídricos");
        setCategoryPoints(
          Object.values(firstWeekPoints.water).reduce(
            (acc, curr) => acc + curr,
            0
          ) / Object.values(firstWeekPoints.water).length
        );
        setCategoryPointsBefore(
          Object.values(secondWeekPoints.water).reduce(
            (acc, curr) => acc + curr,
            0
          ) / Object.values(secondWeekPoints.water).length
        );

        break;
      case "water":
        setArea("air");
        setCategory("climatização");
        setCategoryPoints(
          Object.values(firstWeekPoints.water).reduce(
            (acc, curr) => acc + curr,
            0
          ) / Object.values(firstWeekPoints.water).length
        );
        setCategoryPointsBefore(
          Object.values(secondWeekPoints.air).reduce(
            (acc, curr) => acc + curr,
            0
          ) / Object.values(secondWeekPoints.air).length
        );

        break;
    }
  }, [loadArea]);

  if (!categoryPoints || dataLine.length <= 0 || optionsLine.length <= 0) {
    return null;
  }

  return (
    <div className="container">
      <div className="leftSection">
        <div className="iconsTab">
          <LogoSvg width="25vh"  />
          <AirIcon
            color={area === "air" ? CONST.purple : CONST.secondaryGray}
          />
          <EnergyIcon
            color={area === "energy" ? CONST.yellow : CONST.secondaryGray}
          />
          <MovementIcon
            color={area === "movement" ? CONST.pink : CONST.secondaryGray}
          />
          <RecycleIcon
            color={area === "recycle" ? CONST.green : CONST.secondaryGray}
          />
          <WaterIcon
            color={area === "water" ? CONST.blue : CONST.secondaryGray}
          />
        </div>{" "}
        <div className="window">
          {window === "first" ? (
            <>
              <div className="graphics_left">
                <span className="legend">
                  Pontos de sustentabilidade semanalmente por categorias da
                  organização {orgName}
                </span>
                <Chart
                  chartType="PieChart"
                  width={"100%"}
                  height={"100%"}
                  data={dataRing}
                  options={optionsRing}
                />
                <span className="legend">
                  A categoria de {category} representa{" "}
                  <div className="pointsLegend">
                    <span
                      className="pointsText"
                      style={{ color: rankingColors[area][0] }}
                    >

                      {Math.round((ringPointsPerCategory(dataRing, area)*100)/totalRingPoints(dataRing))}{"%"}
                    </span>
                    {"   "} pontos totais
                  </div>
                </span>
              </div>
              <div className="graphics_left2">
                <div className="graphics_left2_1">
                  <span className="legend">
                    Na categoria de {category} obteve-se uma média de:
                    <div className="pointsLegend">
                      <span
                        className="pointsText"
                        style={{ color: rankingColors[area][0] }}
                      >
                        {Math.round(categoryPoints)}
                      </span>
                      {"   "} pontos totais
                    </div>
                  </span>
                </div>
                <div className="graphics_left2_2">
                  <span className="legend">
                    Ranking de departamento de {orgName} na categoria {category}
                  </span>
                  <br />
                  <div
                    style={{ backgroundColor: rankingColors[area][0] }}
                    className="ranking"
                  >
                    <span>
                      <FaMedal style={{ fontSize: "2.5vh" }} />
                    </span>
                    <span className="rankingText">
                      {" "}
                      {Object.keys(scorePerCategories[area])[0]}
                    </span>
                  </div>
                  <div
                    style={{ backgroundColor: rankingColors[area][1] }}
                    className="ranking"
                  >
                    <span>
                      <FaMedal style={{ fontSize: "2.5vh" }} />
                    </span>
                    <span className="rankingText">
                      {" "}
                      {Object.keys(scorePerCategories[area])[1]}
                    </span>
                  </div>
                  <div
                    style={{ backgroundColor: rankingColors[area][2] }}
                    className="ranking"
                  >
                    <span>
                      <FaMedal style={{ fontSize: "2.5vh" }} />
                    </span>
                    <span className="rankingText">
                      {" "}
                      {Object.keys(scorePerCategories[area])[2]}
                    </span>
                  </div>
                  <div
                    style={{ backgroundColor: rankingColors[area][3] }}
                    className="ranking"
                  >
                    <span>
                      <FaMedal style={{ fontSize: "2.5vh" }} />
                    </span>
                    <span className="rankingText">
                      {" "}
                      {Object.keys(scorePerCategories[area])[3]}
                    </span>
                  </div>
                </div>
              </div>
            </>
          ) : window === "second" ? (
            <div className="graphics_right">
              <span className="legend2">
                <span>
                  {" "}
                  Comparação de pontos de sustentabilidade na categoria de{" "}
                  {category}
                </span>
                <br />
                <span>durante a semana atual e a semana anterior </span>
              </span>

              <Chart
                chartType="LineChart"
                width={"100%"}
                height={"100%"}
                data={dataLine}
                options={optionsLine}
              />
            </div>
          ) : (
            <div className="graphics_right">
              <span className="legend2">
                <span>
                  {" "}
                  Utilização do elevador ao longo da semana {category}
                </span>
                <br />
              </span>

              <Chart
                chartType="LineChart"
                width={"100%"}
                height={"100%"}
                data={dataSensorChart}
                options={optionsLine2}
              />
            </div>
          )}
        </div>
      </div>

      {area === "air" ? (
        <div className="rightSection" style={{ backgroundColor: CONST.purple }}>
          <div className="firstSectionRight">
            <span className="headingText">{msg1}</span>
            <br />
            <span className="headingText">{msg2} </span>
          </div>
          <div className="secondSectionRight">
            <span className="mainText">
              {Math.round(categoryPoints - categoryPointsBefore) > 0 ? (
                <FaArrowUp
                  style={{ fontSize: "6vh" }}
                  color={CONST.pureWhite}
                />
              ) : Math.round(categoryPoints - categoryPointsBefore) < 0 ? (
                <FaArrowDown
                  style={{ fontSize: "6vh" }}
                  color={CONST.pureWhite}
                />
              ) : (
                <FaEquals style={{ fontSize: "6vh" }} color={CONST.pureWhite} />
              )}{" "}
              {Math.abs(
                Math.round(
                  ((categoryPoints - categoryPointsBefore) * 100) /
                    categoryPointsBefore
                )
              )}
              <span className="mainSymbol">
                {" "}
                <a style={{ fontSize: "7vh" }}>%</a>
              </span>
            </span>
          </div>
          <div className="thirdSectionRight">
            <span className="subText">Climatização</span>
          </div>
          <FaWind
            className="iconRight"
            size={"90vh"}
            color={CONST.pureWhite}
            style={{ opacity: 0.25 }}
          />
        </div>
      ) : area === "energy" ? (
        <div className="rightSection" style={{ backgroundColor: CONST.yellow }}>
          <div className="firstSectionRight">
            <span className="headingText">{msg1}</span>
            <br />
            <span className="headingText">{msg2}</span>
          </div>
          <div className="secondSectionRight">
            <span className="mainText">
              {Math.round(categoryPoints - categoryPointsBefore) > 0 ? (
                <FaArrowUp
                  style={{ fontSize: "6vh" }}
                  color={CONST.pureWhite}
                />
              ) : Math.round(categoryPoints - categoryPointsBefore) < 0 ? (
                <FaArrowDown
                  style={{ fontSize: "6vh" }}
                  color={CONST.pureWhite}
                />
              ) : (
                <FaEquals style={{ fontSize: "6vh" }} color={CONST.pureWhite} />
              )}{" "}
              {Math.abs(
                Math.round(
                  ((categoryPoints - categoryPointsBefore) * 100) /
                    categoryPointsBefore
                )
              )}
              <span className="mainSymbol">
                {" "}
                <a style={{ fontSize: "7vh" }}>%</a>
              </span>
            </span>
          </div>
          <div className="thirdSectionRight">
            <span className="subText">Energia Elétrica</span>
          </div>
          <FaBolt
            className="iconRight"
            size={"90vh"}
            color={CONST.pureWhite}
            style={{ opacity: 0.25 }}
          />
        </div>
      ) : area === "movement" ? (
        <div className="rightSection" style={{ backgroundColor: CONST.pink }}>
          <div className="firstSectionRight">
            <span className="headingText">{msg1}</span>
            <br />
            <span className="headingText">{msg2}</span>
          </div>
          <div className="secondSectionRight">
            <span className="mainText">
              {Math.round(categoryPoints - categoryPointsBefore) > 0 ? (
                <FaArrowUp
                  style={{ fontSize: "6vh" }}
                  color={CONST.pureWhite}
                />
              ) : Math.round(categoryPoints - categoryPointsBefore) < 0 ? (
                <FaArrowDown
                  style={{ fontSize: "6vh" }}
                  color={CONST.pureWhite}
                />
              ) : (
                <FaEquals style={{ fontSize: "6vh" }} color={CONST.pureWhite} />
              )}{" "}
              {Math.abs(
                Math.round(
                  ((categoryPoints - categoryPointsBefore) * 100) /
                    categoryPointsBefore
                )
              )}
              <span className="mainSymbol">
                {" "}
                <a style={{ fontSize: "7vh" }}>%</a>
              </span>
            </span>
          </div>
          <div className="thirdSectionRight">
            <span className="subText">Mobilidade</span>
          </div>
          <FaWalking
            className="iconRight"
            size={"90vh"}
            color={CONST.pureWhite}
            style={{ opacity: 0.25 }}
          />
        </div>
      ) : area === "recycle" ? (
        <div className="rightSection" style={{ backgroundColor: CONST.green }}>
          <div className="firstSectionRight">
            <span className="headingText">{msg1}</span>
            <br />
            <span className="headingText">{msg2}</span>
          </div>
          <div className="secondSectionRight">
            <span className="mainText">
              {Math.round(categoryPoints - categoryPointsBefore) > 0 ? (
                <FaArrowUp
                  style={{ fontSize: "6vh" }}
                  color={CONST.pureWhite}
                />
              ) : Math.round(categoryPoints - categoryPointsBefore) < 0 ? (
                <FaArrowDown
                  style={{ fontSize: "6vh" }}
                  color={CONST.pureWhite}
                />
              ) : (
                <FaEquals style={{ fontSize: "6vh" }} color={CONST.pureWhite} />
              )}
              {Math.abs(
                Math.round(
                  ((categoryPoints - categoryPointsBefore) * 100) /
                    categoryPointsBefore
                )
              )}
              <span className="mainSymbol">
                {" "}
                <a style={{ fontSize: "7vh" }}>%</a>
              </span>
            </span>
          </div>
          <div className="thirdSectionRight">
            <span className="subText">Reciclagem</span>
          </div>
          <FaRecycle
            className="iconRight"
            size={"90vh"}
            color={CONST.pureWhite}
            style={{ opacity: 0.25 }}
          />
        </div>
      ) : (
        <div className="rightSection" style={{ backgroundColor: CONST.blue }}>
          <div className="firstSectionRight">
            <span className="headingText">{msg1}</span>
            <br />
            <span className="headingText">{msg2}</span>
          </div>
          <div className="secondSectionRight">
            <span className="mainText">
              {" "}
              {Math.round(categoryPoints - categoryPointsBefore) > 0 ? (
                <FaArrowUp
                  style={{ fontSize: "6vh" }}
                  color={CONST.pureWhite}
                />
              ) : Math.round(categoryPoints - categoryPointsBefore) < 0 ? (
                <FaArrowDown
                  style={{ fontSize: "6vh" }}
                  color={CONST.pureWhite}
                />
              ) : (
                <FaEquals style={{ fontSize: "6vh" }} color={CONST.pureWhite} />
              )}{" "}
              {Math.abs(
                Math.round(
                  ((categoryPoints - categoryPointsBefore) * 100) /
                    categoryPointsBefore
                )
              )}
              <span className="mainSymbol">
                {" "}
                <a style={{ fontSize: "7vh" }}>%</a>
              </span>
            </span>
          </div>
          <div className="thirdSectionRight">
            <span className="subText">Recursos Hídricos</span>
          </div>
          <FaFaucet
            className="iconRight"
            size={"90vh"}
            color={CONST.pureWhite}
            style={{ opacity: 0.25 }}
          />
        </div>
      )}
    </div>
  );
}

export default App;
