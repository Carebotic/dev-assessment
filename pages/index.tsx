import React from 'react';
import { ShiftTable } from '../components/ShiftPlanner';

const HomePage: React.FC = () => {
    return (
        <>
            <div className="min-h-screen text-white flex items-center justify-center">
                <ShiftTable/>
            </div>
        </>
    );
};

export default HomePage;
