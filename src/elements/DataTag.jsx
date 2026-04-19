import { Tag, useColorModeValue } from "@chakra-ui/react";
import { translation } from "../utility/translation";

export const DataTags = ({
  isPatreon,
  isRox,
  isProgramAI,
  isNew,
  grade = null,
  userLanguage,
}) => {
  const numericGrade = Number.parseInt(String(grade).replace(/\D/g, ""), 10);
  const isPerfectGrade = numericGrade === 100;
  const gradeBg = useColorModeValue(
    isPerfectGrade ? "green.600" : "pink.500",
    isPerfectGrade ? "#6EE7B7" : "#F9A8D4",
  );
  const gradeColor = useColorModeValue(
    "white",
    isPerfectGrade ? "#052E16" : "#500724",
  );
  const gradeBorderColor = useColorModeValue(
    isPerfectGrade ? "green.700" : "pink.600",
    isPerfectGrade ? "rgba(16, 185, 129, 0.42)" : "rgba(236, 72, 153, 0.42)",
  );

  return (
    <>
      {isRox ? (
        <Tag size="sm" variant="solid" colorScheme="purple" m={1}>
          Rox
        </Tag>
      ) : null}
      {isPatreon ? (
        <Tag size="sm" variant="solid" colorScheme="teal" m={1}>
          Patreon
        </Tag>
      ) : null}
      {isProgramAI ? (
        <Tag size="sm" variant="solid" colorScheme="pink" m={1}>
          Robots Building Education
        </Tag>
      ) : null}
      {isNew ? (
        <Tag
          size="sm"
          variant="solid"
          colorScheme="cyan"
          m={1}
          height="fit-content"
        >
          {translation[localStorage.getItem("userLanguage")]?.["label.new"] ||
            "New!"}
        </Tag>
      ) : null}
      {grade ? (
        <Tag
          size="sm"
          variant="solid"
          bg={gradeBg}
          color={gradeColor}
          borderWidth="1px"
          borderColor={gradeBorderColor}
          fontWeight="bold"
          px={3}
          py={1}
          borderRadius="full"
        >
          {grade}
        </Tag>
      ) : null}

      {grade ? null : (
        <>
          {" "}
          <br /> <br />
        </>
      )}
    </>
  );
};
