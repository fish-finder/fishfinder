import React, { useRef, useState, useEffect } from "react";
import styled from "styled-components";
import Sheet from "react-modal-sheet";
// import { SheetRef } from "react-modal-sheet";
import { useNavigate } from "react-router-dom";

import CameraButton from "../../assets/icons/scanCamera.png";
import { gray3, gray5 } from "../../assets/styles/palettes";

import data from "../../services/dummy/Fish.json";
import boxdata from "../../services/dummy/fishScan.json";

const Wrapper = styled.div`
  width: 100%;
  height: auto;
  display: flex;
  flex-direction: column;
  font-family: Pretendard;
`;

const Header = styled.div`
  height: 60px;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;

  & > span {
    font-size: 22px;
    font-weight: bold;
  }
`;

const Contents = styled.div`
  width: 100%;
  height: auto;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const VideoBox = styled.div`
  width: 100%;
  height: 75vh;

  & > video {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const ScanButton = styled.img`
  position: absolute;
  width: 70px;
  height: 70px;
  bottom: 15%;
`;

const Info = styled.div`
  display: flex;
  height: 10vh;
  width: 100%;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  & > span {
    font-size: 15px;
    color: ${gray3};
  }
`;

const FishInfo = styled.div`
  display: flex;
  width: 90%;
  height: 80vh;
  margin: 0 5% 0 5%;
  flex-direction: column;
  align-items: center;
  font-family: Pretendard;

  & > p {
    font-size: 18px;
    font-weight: bold;
  }
`;

const Image = styled.img`
  width: 80%;
  object-fit: cover;
  margin-bottom: 10px;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Th = styled.th`
  border-bottom: 1px solid ${gray3};
  color: ${gray5};
  padding: 8px;
  text-align: center;
`;

const Td = styled.td`
  color: ${gray5};
  padding: 8px;
  text-align: center;
`;
export default function Scan() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const photoRef = useRef<HTMLCanvasElement>(null);
  const [page, setPage] = useState("cam");

  const getVideo = () => {
    // 미디어 설정에서 후면 카메라를 지정

    const constraints = {
      video: { facingMode: "environment" },
    };

    navigator.mediaDevices
      .getUserMedia(constraints)
      .then((stream) => {
        // video 태그의 소스로 스트림을 지정
        const video = videoRef.current;
        if (video) {
          video.pause();
          video.srcObject = stream;
          video.play();
        } else {
          console.error("Video element not found.");
        }
      })
      .catch((err) => {
        console.error("카메라에 접근할 수 없습니다.", err);
      });
  };

  // 사진 찍기
  const takePhoto = () => {
    const video = videoRef.current;
    const photo = photoRef.current;

    if (!video) {
      console.error("Video element not found.");
      return;
    }

    if (!photo) {
      console.error("Photo element not found.");
      return;
    }

    const context = photo.getContext("2d");

    // Ensure context is not null
    if (!context) {
      console.error("캔버스 컨텍스트를 찾을 수 없습니다.");
      return;
    }

    // video의 크기에 맞게 canvas 크기를 조절
    photo.width = video.videoWidth;
    photo.height = video.videoHeight;
    context.drawImage(video, 0, 0, photo.width, photo.height);

    // canvas에서 이미지 데이터 가져오기 (예: PNG 형식)
    const imageData = photo.toDataURL("image/png");
    console.log(imageData); // 이 데이터를 사용하거나 저장
    video.pause();

    //data 백으로 보내기

    setPage("Image");
  };

  if (page === "cam") {
    getVideo();
  }

  const [isOpen, setOpen] = useState(false);
  // const ref = useRef<SheetRef>();
  const navigate = useNavigate();

  const handleSnap = (snapIndex: number) => {
    if (snapIndex === 0) {
      // 페이지 이동
      navigate("/info/1");
    }
  };

  return (
    <Wrapper>
      <Header>
        <span>어종 스캔</span>
      </Header>

      {page === "cam" ? (
        <Contents>
          <VideoBox>
            <video ref={videoRef}></video>
          </VideoBox>
          <ScanButton src={CameraButton} onClick={takePhoto}></ScanButton>
          <canvas ref={photoRef} style={{ display: "none" }}></canvas>
          <Info>
            <span>물고기를 촬영하여</span> <span>정보와 시세를 확인하세요</span>
          </Info>
        </Contents>
      ) : (
        <Contents>
          {boxdata &&
            boxdata.map((data, index) => (
              <button onClick={() => setOpen(true)} key={index}>
                Open sheet
              </button>
            ))}

          <Sheet
            isOpen={isOpen}
            onClose={() => setOpen(false)}
            detent="content-height"
            snapPoints={[1200, 750]}
            onSnap={handleSnap}
            initialSnap={1}
          >
            <Sheet.Container>
              <Sheet.Header />
              <Sheet.Content>
                <FishInfo>
                  <Image src={data.imgUri} />
                  <p>{data.name}</p>
                  <Table>
                    <thead>
                      <tr>
                        <Th></Th>
                        <Th>
                          <span>타사이트</span>
                        </Th>
                        <Th>
                          물어바종
                          <br />
                          평균거래가
                        </Th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <Td>1kg 당</Td>
                        <Td> {data.otherPrice}원~</Td>
                        <Td> {data.ourPrice}원~</Td>
                      </tr>
                    </tbody>
                  </Table>
                </FishInfo>
              </Sheet.Content>
            </Sheet.Container>
            <Sheet.Backdrop />
          </Sheet>
        </Contents>
      )}
    </Wrapper>
  );
}
