import React, { useState, useEffect } from "react";
import { Card, CardContent } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { MessageCircle } from "lucide-react";

const questionsList = [
    "How can I help you today?",
    "Do you need assistance with anything?",
    "What's the issue you're facing?",
    "Would you like to explore some resources?",
    "Can I provide you with information on something?",
    "What do you want to know more about?",
    "How can I assist you right now?"
];

const RandomQuestions = () => {
    const [randomQuestions, setRandomQuestions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const getRandomQuestions = () => {
        setIsLoading(true);
        const selectedQuestions = [];
        const availableQuestions = [...questionsList];

        for (let i = 0; i < 3; i++) {
            const randomIndex = Math.floor(Math.random() * availableQuestions.length);
            selectedQuestions.push(availableQuestions[randomIndex]);
            availableQuestions.splice(randomIndex, 1);
        }

        setRandomQuestions(selectedQuestions);
        setIsLoading(false);
    };

    useEffect(() => {
        getRandomQuestions();
    }, []);

    return (
        <div className="flex items-center justify-center  w-full  sm:p-4">
            <Card className="w-full  shadow-lg">
                <CardContent className="p-2 sm:p-6">
                    <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-6">
                        <MessageCircle className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500 flex-shrink-0" />
                        <h1 className="text-xl sm:text-2xl font-bold break-words">
                            What can I help with?
                        </h1>
                    </div>

                    <div className="space-y-3 sm:space-y-4">
                        { randomQuestions.map((question, index) => (
                            <Button
                                key={ index }
                                variant="outline"
                                className="w-full justify-start text-left hover:bg-blue-50 hover:text-blue-600 
                                         transition-all duration-200 p-3 sm:p-4 h-auto min-h-[48px] 
                                         whitespace-normal break-words text-sm sm:text-base"
                            >
                                { question }
                            </Button>
                        )) }
                    </div>

                    <div className="mt-2 sm:mt-6 text-center">
                        <Button
                            onClick={ getRandomQuestions }
                            disabled={ isLoading }
                            variant="outline"
                            className="hover:bg-blue-500 hover:text-white text-sm sm:text-base"
                        >
                            { isLoading ? "Loading..." : "Get New Questions" }
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default RandomQuestions;