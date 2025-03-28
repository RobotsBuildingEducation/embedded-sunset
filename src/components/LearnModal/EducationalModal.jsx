import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  VStack,
  Text,
  Spinner,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  HStack,
  extendTheme,
  useStyleConfig,
  useToast,
  Code,
  Heading,
  UnorderedList,
  ListItem,
} from "@chakra-ui/react";
import { BigSunset, SunsetCanvas } from "../../elements/SunsetCanvas";

import { highlight, languages } from "prismjs/components/prism-core";
import "prismjs/components/prism-clike";
import "prismjs/components/prism-javascript";
import "prismjs/themes/prism.css";
import { translation } from "../../utility/translation";
import RandomCharacter from "../../elements/RandomCharacter";
import { CopyButtonIcon } from "../../elements/CopyButtonIcon";
import { animateBorderLoading } from "../../utility/animations";
import { OrbCanvas } from "../../elements/OrbCanvas";
import Markdown from "react-markdown";
import ChakraUIRenderer from "chakra-ui-markdown-renderer";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";

export const newTheme = {
  p: (props) => <Text mb={2} lineHeight="1.6" {...props} />,
  ul: (props) => <UnorderedList pl={6} spacing={2} {...props} />,
  ol: (props) => <UnorderedList as="ol" pl={6} spacing={2} {...props} />,
  li: (props) => <ListItem mb={1} {...props} />,
  h1: (props) => <Heading as="h4" mt={6} size="md" {...props} />,
  h2: (props) => <Heading as="h4" mt={6} size="md" {...props} />,
  h3: (props) => <Heading as="h4" mt={6} size="md" {...props} />,
  code: ({ inline, className, children, ...props }) => {
    const match = /language-(\w+)/.exec(className || "");

    return !inline && match ? (
      <SyntaxHighlighter
        // backgroundColor="white"
        // style={"light"}
        language={match[1]}
        PreTag="div"
        customStyle={{
          backgroundColor: "white", // Match this with the desired color
          color: "black", // Ensure the text matches the background
          padding: "1rem",
          borderRadius: "8px",
          fontSize: 12,
        }}
        {...props}
      >
        {String(children).replace(/\n$/, "")}
      </SyntaxHighlighter>
    ) : (
      <Box
        as="code"
        backgroundColor="gray.100"
        p={1}
        borderRadius="md"
        fontSize="sm"
        {...props}
      >
        {children}
      </Box>
    );
  },
};

const EducationalModal = ({
  isOpen,
  onClose,
  educationalMessages,
  educationalContent,
  userLanguage,
}) => {
  const bottomRef = useRef();
  const topRef = useRef();
  const toast = useToast();
  const [borderState, setBorderState] = useState("0px solid #793feb");

  //          feedbackRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(() => {
    // if (educationalMessages.length > 0 && !educationalContent.length > 0) {
    //   bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    // }
  }, [educationalMessages]);

  useEffect(() => {
    // if (educationalContent.length > 0) {
    //   topRef.current?.scrollIntoView({ behavior: "smooth" });
    // }
  }, [educationalContent]);
  const handleCopyKeys = (id) => {
    if (id) {
      const keys = id; // replace with actual keys
      navigator.clipboard.writeText(keys);
      // toast({
      //   title: translation[userLanguage]["toast.title.keysCopied"],
      //   description: translation[userLanguage]["toast.description.keysCopied"],
      //   status: "info",
      //   duration: 1500,
      //   isClosable: true,
      //   position: "top",
      //   render: () => (
      //     <Box
      //       color="black"
      //       p={3}
      //       bg="#FEEBC8" // Custom background color here!
      //       borderRadius="md"
      //       boxShadow="lg"
      //     >
      //       <Text fontWeight="bold">
      //         {translation[userLanguage]["toast.title.keysCopied"]}
      //       </Text>
      //       <Text>
      //         {translation[userLanguage]["toast.description.keysCopied"]}
      //       </Text>
      //     </Box>
      //   ),
      // });
    } else {
      const keys = localStorage.getItem("local_nsec"); // replace with actual keys
      navigator.clipboard.writeText(keys);
      // toast({
      //   title: translation[userLanguage]["toast.title.keysCopied"],
      //   description: translation[userLanguage]["toast.description.keysCopied"],
      //   status: "info",
      //   duration: 1500,
      //   isClosable: true,
      //   position: "top",
      //   render: () => (
      //     <Box
      //       color="black"
      //       p={3}
      //       bg="#FEEBC8" // Custom background color here!
      //       borderRadius="md"
      //       boxShadow="lg"
      //     >
      //       <Text fontWeight="bold">
      //         {translation[userLanguage]["toast.title.keysCopied"]}
      //       </Text>
      //       <Text>
      //         {translation[userLanguage]["toast.description.keysCopied"]}
      //       </Text>
      //     </Box>
      //   ),
      // });
    }

    animateBorderLoading(
      setBorderState,
      "2px solid teal",
      "0px solid #793feb",
      500
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="full"
      scrollBehavior={"inside"}
    >
      <ModalOverlay />
      {/* Add OrbCanvas as a background */}

      {educationalMessages.length < 1 ? (
        // && !educationalContent.length > 0
        // <ModalOverlay>
        //   <OrbCanvas
        //     instructions={
        //       <b> {translation[userLanguage]["modal.learn.instructions"]}</b>
        //     }
        //   />
        // </ModalOverlay>
        <ModalContent
          style={{ background: "black" }}
          // color="white"
          borderRadius="lg"
          boxShadow="2xl"
          p={0}
          width="100%"

          // style={{ fontFamily: "Roboto Serif, serif" }}
        >
          <Box ref={topRef}></Box>
          <ModalHeader
            fontSize="xl"
            fontWeight="bold"
            marginTop={0}
            paddingTop={0}
            padding={3}
          >
            <ModalCloseButton color="white" size="lg" />
            <HStack>
              <div style={{ width: "fit-content" }}>
                {educationalMessages.length > -1 &&
                !educationalContent.length > 0 ? (
                  <BigSunset />
                ) : (
                  <RandomCharacter />
                )}
              </div>
              &nbsp;
              <div style={{ color: "white" }}>
                {translation[userLanguage]["modal.learn.title"]}
              </div>
            </HStack>
          </ModalHeader>

          <ModalBody p={2} style={{ width: "100%" }}>
            {/* {educationalMessages.length === 0 && <Spinner size="xl" />} */}

            {educationalMessages.length > -1 &&
            !educationalContent.length > 0 ? (
              <div
                style={{
                  color: "#FAF3E0",

                  width: "100%",
                }}
              >
                {/* {educationalMessages[educationalMessages.length - 1]?.content
                  .length < 1 ? ( */}
                <OrbCanvas
                  hasStreamedText={false}
                  instructions={
                    <Text fontWeight={"bold"} fontSize="xl">
                      {" "}
                      {translation[userLanguage]["modal.learn.instructions"]}
                      <br />
                      <br />
                      {
                        educationalMessages[educationalMessages.length - 1]
                          ?.content
                      }
                    </Text>
                  }
                />
                {/* // ) : ( // )}  */}
                <Box ref={bottomRef}></Box>
              </div>
            ) : null}
          </ModalBody>
          {/* <ModalFooter margin={0} padding={3}>
            <Button
              onMouseDown={onClose}
              variant="solid"
              size="lg"
              boxShadow={"0px 0.5px 0.5px 1px black"}
            >
              {translation[userLanguage]["button.close"]}
            </Button>
          </ModalFooter> */}
        </ModalContent>
      ) : (
        <ModalContent
          style={{ backgroundColor: "#F8F5F0" }}
          // color="white"
          borderRadius="lg"
          boxShadow="2xl"
          p={0}
          width="100%"

          // style={{ fontFamily: "Roboto Serif, serif" }}
        >
          <Box ref={topRef}></Box>
          <ModalHeader
            fontSize="xl"
            fontWeight="bold"
            marginTop={0}
            paddingTop={0}
            pb={0}

            // height="100%"
          >
            <ModalCloseButton size="lg" />

            <HStack mb={0}>
              <div style={{ width: "fit-content" }}>
                {/* {educationalMessages.length > 0 
                &&
                !educationalContent.length > 0 ? 
                (
                  <BigSunset />
                ) : ( */}
                <RandomCharacter />
                {/* // )} */}
              </div>
              &nbsp;
              <div>{translation[userLanguage]["modal.learn.title"]}</div>
            </HStack>
          </ModalHeader>

          <ModalBody
            p={2}
            style={{
              width: "100%",

              display: "flex",
              justifyContent: "center",
            }}
          >
            {/* {educationalMessages.length === 0 && <Spinner size="xl" />} */}
            {/* 
            {educationalMessages.length > -1 &&
            !educationalContent.length > 0 ? (
              <div
                style={{
                  color: "#FAF3E0",

                  width: "100%",
                }}
              >
                <b
                  style={{
                    backgroundColor: "white",
                    color: "black",
                    padding: 4,
                    borderRadius: "6px",
                  }}
                >
                  {" "}
                  {translation[userLanguage]["modal.learn.instructions"]}
                </b>
                <br />
                <br />
                {educationalMessages[educationalMessages.length - 1]?.content
                  .length < 1 ? (
                  <SunsetCanvas
                    hasAnimation={false}
                    isLoader={true}
                    hasInitialFade={false}
                    regulateWidth={false}
                  />
                ) : (
                  educationalMessages[educationalMessages.length - 1]?.content
                )}{" "}
                <Box ref={bottomRef}></Box>
              </div>
            ) : null} */}
            <VStack
              spacing={6}
              alignItems="flex-start"
              maxWidth="600px"
              minWidth="300px"
              width="100%"
            >
              {educationalMessages.length > 0 &&
                educationalMessages.map((content, index) => (
                  <Box
                    fontFamily={"Avenir"}
                    key={index}
                    p={4}
                    // bg="#170029"
                    borderRadius="md"
                    borderWidth={1}
                    // borderColor="rgba(255, 255, 255, 0.0)"
                    textAlign={"left"}
                    width="100%"

                    // boxShadow="md"
                    // boxShadow="0px 0.5px 0.5px 1px black"
                  >
                    {/* <Text fontSize="xl" fontWeight="bold">
                    Code Example:
                  </Text> */}
                    {/* {content.code ? (
                      <div
                        style={{
                          //   color: "#696969",
                          backgroundColor: "#faf3e0",
                          // width: "100%",
                          padding: 20,
                          // wordBreak: "break-word",
                          display: "flex",
                          flexDirection: "column",
                          borderRadius: 30,
                          boxShadow: "0px 0.5px 0.5px 1px rgba(0,0,0,0.75)",
                          zoom: "0.8",
                          // border: "5px solid green",

                          width: "100%",
                          overflowX: "auto",
                        }}
                      >
                        <Markdown
                          theme={ChakraUIRenderer(newTheme)}
                          children={`\`\`\`${content.code}`}
                          // inline={false}
                        ></Markdown>

                        <div
                          style={{
                            display: "flex",
                            justifyContent: "flex-end",
                          }}
                        >
                          <Button
                            style={{
                              display: "flex",
                              border: borderState,
                            }}
                            tabIndex={0}
                            onMouseDown={() => handleCopyKeys(content.code)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                handleCopyKeys(content.code);
                              }
                            }}
                            width={24}
                          >
                            <div style={{ width: "min-content" }}>
                              <CopyButtonIcon color="black" />
                            </div>
                            &nbsp;
                          </Button>
                        </div>
                      </div>
                    ) : null} */}
                    {/* <Text fontSize="xl" fontWeight="bold" mt={3}>
                    Explanation:
                  </Text> */}

                    <Markdown
                      components={ChakraUIRenderer(newTheme)}
                      children={content.content}
                    />
                  </Box>
                ))}
            </VStack>
          </ModalBody>
          <ModalFooter mr={4} mb={1} padding={3}>
            <Button
              onMouseDown={onClose}
              variant="solid"
              size="sm"
              boxShadow="0.5px 0.5px 1px 0px rgba(0,0,0,0.75)"
            >
              {translation[userLanguage]["button.close"]}
            </Button>
          </ModalFooter>
        </ModalContent>
      )}
    </Modal>
  );
};

export default EducationalModal;
