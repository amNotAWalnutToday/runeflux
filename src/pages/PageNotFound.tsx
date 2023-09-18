import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function PageNotFound() {
    const navigate = useNavigate();
    
    useEffect(() => {
        navigate('/')
        /*eslint-disable-next-line*/
    }, []);
    
    return (
        <div>
            Error 404
        </div>
    )
}
