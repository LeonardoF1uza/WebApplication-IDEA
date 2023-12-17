import { FaWind, FaRecycle, FaFaucet, FaWalking, FaBolt } from "react-icons/fa";
import * as CONST from '../styling/constants.js';
import { styles } from '../styling/styles.js';
import './areas_icons.css';

export const AirIcon = ({color}) => {
    return(
    <div className="areaIcon" style={{backgroundColor: color}} >
        <FaWind size={30} color={CONST.pureWhite} />
    </div>
    )
}

export const RecycleIcon = ({color}) => {
    return(
    <div className="areaIcon" style={{backgroundColor: color}} >
        <FaRecycle size={30} color={CONST.pureWhite} />
    </div>
    )
}

export const MovementIcon = ({color}) => {
    return(
    <div className="areaIcon" style={{backgroundColor: color}} >
        <FaWalking size={30} color={CONST.pureWhite} />
    </div>
    )
}

export const EnergyIcon = ({color}) => {
    return(
    <div className="areaIcon" style={{backgroundColor: color}} >
        <FaBolt size={30} color={CONST.pureWhite} />
    </div>
    )
}

export const WaterIcon = ({color}) => {
    return(
    <div className="areaIcon" style={{backgroundColor: color}} >
        <FaFaucet size={30} color={CONST.pureWhite} />
    </div>
    )
}