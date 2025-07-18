import React from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { FaReact, FaNodeJs, FaPython } from "react-icons/fa";
import { CgWebsite } from "react-icons/cg";
import { AiOutlineConsoleSql } from "react-icons/ai";
import { MdOutlinePhp } from "react-icons/md";
import { useNavigate } from 'react-router-dom';

const CodeGenerator = () => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const navigate = useNavigate();

    const cardClass = `flex flex-col text-center justify-center items-center 
                      border border-gray-400 rounded-md p-4 cursor-pointer
                      transition-all duration-300 h-32 
                      ${isDark ? 'bg-gray-800 text-white hover:bg-gray-700' : 'bg-white text-black hover:bg-gray-100'}`;

    return (
        <div className={ `min-h-screen w-full ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-black'}` }>
            <div className="container mx-auto py-8 px-4">
                <h1 className={ `text-2xl font-bold mb-6 text-center ${isDark ? 'text-white' : 'text-gray-800'}` }>
                    Code Generator Tools
                </h1>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">

                    <button onClick={ () => navigate('/dashboard/codegenerator/htmlcssjs') }>
                        <div className={ cardClass }>
                            <CgWebsite className="text-4xl mb-2" style={ { color: '#E44D26' } } />
                            <h6 className="font-medium">HTML, CSS, JS Writer</h6>
                        </div>
                    </button>


                    <div className={ cardClass } onClick={ () => navigate('/dashboard/codegenerator/python') }>
                        <FaPython className="text-4xl mb-2" style={ { color: '#3776AB' } } />
                        <h6 className="font-medium">Python Code Writer</h6>
                    </div>

                    <div className={ cardClass } onClick={ () => navigate('/dashboard/codegenerator/sqlscript') }>
                        <AiOutlineConsoleSql className="text-4xl mb-2" style={ { color: '#F29111' } } />
                        <h6 className="font-medium">SQL Query Writer</h6>
                    </div>


                </div>
            </div>
        </div>
    );
};

export default CodeGenerator;