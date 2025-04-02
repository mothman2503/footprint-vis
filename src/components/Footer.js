import React from 'react';
import { Link } from 'react-router-dom';
import { VscGithub, VscArrowCircleRight } from "react-icons/vsc";
import { useTranslation } from "react-i18next";

import navLinks from "../navLinks";

const Footer = () => {
    const { t } = useTranslation(); 

    const aboutLink = navLinks.find(link => link.label === "about"); // Use translation for "ABOUT"

    return (
        <footer className="bg-slate-800 h-52 text-white flex justify-around items-end p-6 space-x-8">
            <div className='flex flex-col'>
                {aboutLink && (
                    <>
                        <p className='font-mono text-sm'>
                            <Link className='text-sky-300 hover:underline hover:text-indigo-300' to={aboutLink.path}>
                                {t("footer.about")}
                            </Link>
                            <br />

                            {t("footer.readAbout")}{" "}
                            <VscArrowCircleRight className='inline' />
                        </p>
                    </>
                )}

                <p className='font-mono text-sm'>
                    {t("footer.basedOn")}
                    <Link className='text-sky-300 hover:underline hover:text-indigo-300' to="https://www.madetomeasure.online/de/">
                        {" "}{t("footer.madeToMeasure")}
                    </Link>
                </p>
            </div>

            <p className='flex items-center font-mono'>
                <VscGithub className='mr-2' /> Hello
            </p>
        </footer>
    );
};

export default Footer;
