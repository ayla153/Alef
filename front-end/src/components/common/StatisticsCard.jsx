import '../../styles/StatisticsCard.css'
import { FaEnvelope, FaClock, FaStar } from 'react-icons/fa';

export default function RequestsCard({title , icon , count , bgcolor , hcolor}){
    return(
        <div className="requests-card">
            <div className="card-content">
                <h3 className="card-title">{title}</h3>
                {count !== undefined && <p className="card-count">{count}</p>}
            </div>
            <div className="card-icon-wrapper" style={{'background':bgcolor , '--hover-color': hcolor }}>
                {icon}
            </div>
        </div>
    )
}