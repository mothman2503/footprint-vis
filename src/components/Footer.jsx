import React from 'react';
import { Link } from 'react-router-dom';
import { VscGithub, VscArrowCircleRight } from "react-icons/vsc";
import { useTranslation } from "react-i18next";


const Footer = () => {
    const { t } = useTranslation(); 

    return (
        <footer className="h-52 w-full text-white flex justify-around items-end p-6 space-x-8 z-10" style={{background: "##044223",
background: "linear-gradient(244deg,rgba(4, 66, 35, 1) 0%, rgba(15, 92, 110, 1) 100%)"}}>
            <div className='h-full flex flex-col justify-between'>
            <p className='font-mono text-sm'>
                            <Link className='text-sky-300 hover:underline hover:text-indigo-300' to={"/about"}>
                                {t("nav.about")}
                            </Link>
                            <br />

                            {t("footer.readAbout")}{" "}
                            <VscArrowCircleRight className='inline' />
                        </p>

                <p className='font-mono text-sm'>
                    {t("footer.basedOn")}{" "}
                    <Link className='text-sky-300 hover:underline hover:text-indigo-300' to="https://www.madetomeasure.online/de/">
                        {t("footer.madeToMeasure")}
                    </Link>
                </p>
            </div>

            <Link to={"https://github.com/mothman2503/footprint-vis"} className='flex items-center text-sky-300 font-mono hover:text-indigo-300'>
                <VscGithub className='mr-2 sky-300' /> GitHub
            </Link>
        </footer>
    );
};

export default Footer;
