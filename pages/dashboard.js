import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import NextImage from 'next/image'
import { CldImage } from "next-cloudinary"
import Compressor from "compressorjs";
import { useAuthContext } from "../utils/contexts/AuthContext";
import useAuthAxios from "../utils/hooks/useAuthAxios";
import lingpalIcon from "../assets/logo.svg";
import uploadIcon from "../assets/upload-image.svg";
import pencilIcon from "../assets/pencil.svg";
import gamelIcon from "../assets/game.svg";
import badgeIcon from "../assets/badge.svg";
import gearsIcon from "../assets/gears.svg";
import infoIcon from "../assets/info.png";
import { useGameContext } from "../utils/contexts/GameContext";
import { Card, CardBody, CardHeader } from "../components/Card";

export default function Dashboard(){
  const { setPlayers, setInGame, setRoomId, setRound, setDescriberIndex } =
    useGameContext();
  const { user, setUser} = useAuthContext();
  const authAxios = useAuthAxios();

  const win = !user.total ? 0 : ((user.win * 100) / user.total).toFixed(1);
  const hardPlayer = !user.total
    ? 0
    : ((user.advanced * 100) / user.total).toFixed(1);

  const compress = (file, options) => {
    return new Promise((resolve, reject) => {
      new Compressor(file, {
        ...options,
        success(result) {
          resolve(result);
        },
        error(err) {
          reject(err);
        },
      });
    });
  };

  const router = useRouter()
	const navigate = router.push;

  const uploadImage = async (imageFile) => {
    console.log("uploading");
    if (!imageFile) return;
    const allowedType = ["image/jpeg", "image/jpg", "image/png"];
    if (!allowedType.includes(imageFile.type)) {
      console.log("file not supported");
      return;
    }
    if (imageFile.size > 10000) {
      imageFile = await compress(imageFile, { maxWidth: 100 });
    }
    const reader = new FileReader();
    reader.readAsDataURL(imageFile);
    reader.onloadend = () => {
      authAxios
        .post("/api/change_avatar", {
          data: reader.result,
        })
        .then((response) => {
          setUser((prev) => ({ ...prev, avatar: response.data.id }));
        });
    };
  };

  const play = () => {
    initializeSettings();
    navigate("/game_settings");
  };

  const initializeSettings = () => {
    setRound(0);
    setDescriberIndex(0);
    setPlayers({});
    setInGame(false);
    setRoomId(null);
  };

  const logout = () => {
    fetch("/api/logout", {
      credentials: "include",
    }).then(() => {
      setUser(null);
    });
  };

  return (
    <div className="cyan-gradient h-screen overflow-hidden">
      <div className="relative top-0 z-10 w-full flex justify-start">
        <div className="flex items-center m-2 sm:ml-8 sm:mt-4">
          <div className="w-12">
          <NextImage
            src={lingpalIcon}
            alt="Logo"
            width={50}
            height={50}
          />
          </div>
          <p className="pl-2 font-bold sm:text-xl md:text-2xl md:pl-4">
            Lingpal
          </p>
        </div>
      </div>
      <div className="w-full mx-auto relative flex flex-col items-center">
        <Link href="/about" className="absolute right-0 top-0 flex items-center cursor-pointer">
          <NextImage
            src={infoIcon}
            alt="about the game"
            width={24}
            height={24}
          />
          <h5 className="text-orange-400 ml-1 font-semibold">About</h5>
        </Link>
        <Card className="w-96 max-w-[90%]">
          <CardHeader className='flex justify-end pt-6 px-6 pb-1'>
            <label 
            className="cursor-pointer absolute left-12 bottom-2 h-8 w-20 p-1 rounded bg-[#D9D9D9B0] flex justify-end items-center">
              <NextImage
                src={uploadIcon}
                alt="upload image"
                width={24}
                height={24}
              />
              <input
                tabIndex="0"
                onChange={(e) => uploadImage(e.target.files[0])}
                type="file"
                className="hidden"
              />
            </label>
            <CldImage
              className="absolute left-4 bottom-2 w-20 rounded-full object-contain object-center"
              width="100"
              height="100" 
              src={user.avatar}
              alt="user avatar"
            />
            <div className="relative mb-1 text-lg text-semibold rounded bg-[#D9D9D9B0] h-8 px-2 py-1 text-color1-dark flex gap-2">
              <p>{user.username}</p>
              <NextImage
                src={pencilIcon}
                alt="pencil"
                width={24}
                height={24}
              />
            </div>
          </CardHeader>
          <CardBody className='px-6 py-8'>
            <div className="flex flex-col">
              <div className="my-4 md:text-lg flex justify-between">
                <span className="flex gap-2">
                  <NextImage
                    src={gamelIcon}
                    alt="game"
                    width={24}
                    height={24}
                  />
                  <p>Total</p>
                </span>
                <span className="">{user.total}</span>
              </div>
              <hr/>
              <div className="my-4 md:text-lg flex justify-between">
                <span className="flex gap-2">
                  <NextImage
                    src={badgeIcon}
                    alt="winning badge"
                    width={24}
                    height={24}
                  />
                  <p>Win</p>
                </span>
                <span className="">{win}%</span>
              </div>
              <hr/>
              <div className="my-4 md:text-lg flex justify-between">
                <span className="flex gap-2">
                  <NextImage
                    src={gearsIcon}
                    alt="3 gears"
                    width={24}
                    height={24}
                  />
                  <p>Hard</p>
                </span>
                <span className="">{hardPlayer}%</span>
              </div>
            </div>
          </CardBody>
        </Card>
        <div className="w-full flex justify-end">
          <button
            onClick={logout}
            className="mt-2 cursor-pointer text-red-700 font-semibold"
          >
            Logout
          </button>
        </div>
        <div className="w-full pb-8 flex flex-col">
          <button className="play-button self-center" onClick={play}>
            Play
          </button>
        </div>
      </div>
    </div>
  );
};

Dashboard.requireAuth = true
