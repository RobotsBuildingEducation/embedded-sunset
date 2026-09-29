import React, { useState, useMemo, useRef } from "react";
import {
  Box,
  Flex,
  Text,
  Badge,
  HStack,
  VStack,
  Tooltip,
  IconButton,
  Button,
  useColorModeValue,
} from "@chakra-ui/react";
import { FaDownload, FaEye } from "react-icons/fa";

/**
 * Calculates SVG path for an arc wedge.
 */
function createArcPath({ cx, cy, innerRadius, outerRadius, startAngle, endAngle }) {
  const isFullCircle = endAngle - startAngle >= 2 * Math.PI - 0.001;

  if (isFullCircle) {
    if (innerRadius <= 0) {
      return `M ${cx} ${cy - outerRadius} A ${outerRadius} ${outerRadius} 0 1 0 ${cx} ${cy + outerRadius} A ${outerRadius} ${outerRadius} 0 1 0 ${cx} ${cy - outerRadius} Z`;
    }
    return `M ${cx} ${cy - outerRadius} A ${outerRadius} ${outerRadius} 0 1 0 ${cx} ${cy + outerRadius} A ${outerRadius} ${outerRadius} 0 1 0 ${cx} ${cy - outerRadius} Z M ${cx} ${cy - innerRadius} A ${innerRadius} ${innerRadius} 0 1 1 ${cx} ${cy + innerRadius} A ${innerRadius} ${innerRadius} 0 1 1 ${cx} ${cy - innerRadius} Z`;
  }

  const x1 = cx + outerRadius * Math.cos(startAngle);
  const y1 = cy + outerRadius * Math.sin(startAngle);
  const x2 = cx + outerRadius * Math.cos(endAngle);
  const y2 = cy + outerRadius * Math.sin(endAngle);

  const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;

  if (innerRadius <= 0) {
    return `M ${cx} ${cy} L ${x1} ${y1} A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
  }

  const x3 = cx + innerRadius * Math.cos(endAngle);
  const y3 = cy + innerRadius * Math.sin(endAngle);
  const x4 = cx + innerRadius * Math.cos(startAngle);
  const y4 = cy + innerRadius * Math.sin(startAngle);

  return `M ${x1} ${y1} A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4} Z`;
}

export const PieChartRenderer = ({
  rows = [],
  chartType = "pie", // "pie" | "donut" | "semi" | "rose" | "exploded"
  title = "Untitled Chart",
  donutHolePercent = 55,
  showLegend = true,
  showPercentages = true,
}) => {
  const [hoveredSlice, setHoveredSlice] = useState(null);
  const svgRef = useRef(null);

  // Background and border colors matching theme
  const surfaceBg = useColorModeValue("white", "#0C1528");
  const borderColor = useColorModeValue("rgba(104,85,64,0.15)", "rgba(148,163,184,0.18)");
  const textColor = useColorModeValue("#201B16", "#ECF2FF");
  const textMuted = useColorModeValue("#5E564C", "#A9B8D7");
  const sliceStroke = useColorModeValue("#ffffff", "#0C1528");

  // Filter valid rows with positive numbers
  const validRows = useMemo(() => {
    return (rows || [])
      .map((row, idx) => ({
        ...row,
        numericValue: Math.max(0, parseFloat(row.value) || 0),
        origIndex: idx,
      }))
      .filter((r) => r.numericValue > 0);
  }, [rows]);

  const totalValue = useMemo(() => {
    return validRows.reduce((sum, r) => sum + r.numericValue, 0);
  }, [validRows]);

  // Compute slice geometries
  const slices = useMemo(() => {
    if (totalValue <= 0 || validRows.length === 0) return [];

    const isSemi = chartType === "semi";
    const isRose = chartType === "rose";
    const isExploded = chartType === "exploded";
    const isDonut = chartType === "donut";

    const cx = 200;
    const cy = isSemi ? 220 : 200;
    const baseRadius = isSemi ? 170 : 155;
    const holeRadius = isDonut ? baseRadius * (donutHolePercent / 100) : (isSemi ? baseRadius * 0.45 : 0);

    const totalAngle = isSemi ? Math.PI : 2 * Math.PI;
    const startAngleOffset = isSemi ? -Math.PI : -Math.PI / 2;

    const maxVal = Math.max(...validRows.map((r) => r.numericValue), 1);
    let currentAngle = startAngleOffset;

    return validRows.map((row, index) => {
      const percent = (row.numericValue / totalValue) * 100;
      let startAngle = currentAngle;
      let endAngle;
      let outerRadius = baseRadius;
      let innerRadius = holeRadius;

      if (isRose) {
        // Rose/Polar: Equal slice angle, radius proportional to value
        const sliceAngle = (2 * Math.PI) / validRows.length;
        endAngle = startAngle + sliceAngle;
        currentAngle = endAngle;
        const minRadius = baseRadius * 0.25;
        outerRadius = minRadius + (baseRadius - minRadius) * (row.numericValue / maxVal);
        innerRadius = 0;
      } else {
        // Proportional angle
        const sliceAngle = (row.numericValue / totalValue) * totalAngle;
        endAngle = startAngle + sliceAngle;
        currentAngle = endAngle;
      }

      // Exploded offset calculation
      let sliceCx = cx;
      let sliceCy = cy;
      if (isExploded) {
        const midAngle = (startAngle + endAngle) / 2;
        const explodeDistance = 14;
        sliceCx = cx + explodeDistance * Math.cos(midAngle);
        sliceCy = cy + explodeDistance * Math.sin(midAngle);
      }

      const pathData = createArcPath({
        cx: sliceCx,
        cy: sliceCy,
        innerRadius,
        outerRadius,
        startAngle,
        endAngle,
      });

      // Mid-point for labels or callouts
      const midAngle = (startAngle + endAngle) / 2;
      const labelRadius = innerRadius > 0 ? (innerRadius + outerRadius) / 2 : outerRadius * 0.65;
      const labelX = sliceCx + labelRadius * Math.cos(midAngle);
      const labelY = sliceCy + labelRadius * Math.sin(midAngle);

      return {
        ...row,
        percent,
        startAngle,
        endAngle,
        pathData,
        labelX,
        labelY,
        outerRadius,
        innerRadius,
        sliceCx,
        sliceCy,
      };
    });
  }, [validRows, totalValue, chartType, donutHolePercent]);

  // Export SVG file
  const handleDownloadSvg = () => {
    if (!svgRef.current) return;
    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const downloadLink = document.createElement("a");
    downloadLink.href = url;
    downloadLink.download = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "chart"}.svg`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(url);
  };

  const isSemi = chartType === "semi";
  const svgViewBox = isSemi ? "0 40 400 240" : "0 0 400 400";
  const displayHover = hoveredSlice || (slices.length > 0 ? slices[0] : null);

  return (
    <VStack
      spacing={5}
      align="stretch"
      bg={surfaceBg}
      borderWidth="1px"
      borderColor={borderColor}
      borderRadius="2xl"
      p={{ base: 4, md: 6 }}
      boxShadow="sm"
      position="relative"
    >
      {/* Chart Top Bar */}
      <Flex justify="space-between" align="center" wrap="wrap" gap={2}>
        <VStack align="start" spacing={0}>
          <Text fontWeight="bold" fontSize="lg" color={textColor} noOfLines={1}>
            {title || "Untitled Chart"}
          </Text>
          <Text fontSize="xs" color={textMuted}>
            {validRows.length} {validRows.length === 1 ? "slice" : "slices"} • Total:{" "}
            {totalValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </Text>
        </VStack>

        <HStack spacing={2}>
          <Badge
            colorScheme="orange"
            textTransform="uppercase"
            fontSize="xs"
            borderRadius="md"
            px={2}
            py={0.5}
          >
            {chartType}
          </Badge>
          <Tooltip label="Download as SVG" hasArrow>
            <IconButton
              size="sm"
              icon={<FaDownload />}
              aria-label="Download SVG"
              variant="outline"
              borderColor={borderColor}
              onClick={handleDownloadSvg}
            />
          </Tooltip>
        </HStack>
      </Flex>

      {/* SVG Canvas Container */}
      <Box
        position="relative"
        width="100%"
        maxW="480px"
        mx="auto"
        aspectRatio={isSemi ? "16/11" : "1/1"}
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        {totalValue <= 0 || slices.length === 0 ? (
          <VStack
            spacing={3}
            justify="center"
            align="center"
            p={8}
            border="2px dashed"
            borderColor={borderColor}
            borderRadius="2xl"
            width="100%"
            height="100%"
          >
            <Text fontSize="4xl">🥧</Text>
            <Text fontWeight="semibold" color={textColor}>
              No chart data yet
            </Text>
            <Text fontSize="sm" color={textMuted} textAlign="center">
              Add positive row values on the left to render your pie chart.
            </Text>
          </VStack>
        ) : (
          <svg
            ref={svgRef}
            viewBox={svgViewBox}
            style={{
              width: "100%",
              height: "100%",
              overflow: "visible",
              userSelect: "none",
            }}
          >
            <defs>
              <filter id="slice-shadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="4" stdDeviation="6" floodOpacity="0.18" />
              </filter>
            </defs>

            {/* Slices */}
            {slices.map((slice) => {
              const isHovered = hoveredSlice?.id === slice.id;
              return (
                <g key={slice.id || slice.origIndex}>
                  <path
                    d={slice.pathData}
                    fill={slice.color || "#3B82F6"}
                    stroke={sliceStroke}
                    strokeWidth={isHovered ? "3" : "2"}
                    strokeLinejoin="round"
                    style={{
                      cursor: "pointer",
                      transition: "transform 0.18s ease, filter 0.18s ease, opacity 0.18s ease",
                      transformOrigin: `${slice.sliceCx}px ${slice.sliceCy}px`,
                      transform: isHovered ? "scale(1.03)" : "scale(1)",
                      filter: isHovered ? "url(#slice-shadow)" : "none",
                      opacity: hoveredSlice && !isHovered ? 0.8 : 1,
                    }}
                    onMouseEnter={() => setHoveredSlice(slice)}
                    onMouseLeave={() => setHoveredSlice(null)}
                    onClick={() => setHoveredSlice(slice)}
                  />
                  {/* Inline slice percentage label if slice is large enough */}
                  {showPercentages && slice.percent >= 8 && chartType !== "rose" && (
                    <text
                      x={slice.labelX}
                      y={slice.labelY}
                      fill="#FFFFFF"
                      fontSize="12"
                      fontWeight="bold"
                      textAnchor="middle"
                      dominantBaseline="central"
                      pointerEvents="none"
                      style={{
                        textShadow: "0 1px 3px rgba(0,0,0,0.6)",
                      }}
                    >
                      {slice.percent.toFixed(0)}%
                    </text>
                  )}
                </g>
              );
            })}

            {/* Donut Center Details */}
            {chartType === "donut" && (
              <g pointerEvents="none">
                <circle cx={200} cy={200} r={155 * (donutHolePercent / 100)} fill={surfaceBg} />
                <text
                  x={200}
                  y={190}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize="13"
                  fontWeight="medium"
                  fill={textMuted}
                >
                  {displayHover?.name || "Total"}
                </text>
                <text
                  x={200}
                  y={215}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize="20"
                  fontWeight="extrabold"
                  fill={textColor}
                >
                  {displayHover?.numericValue
                    ? displayHover.numericValue.toLocaleString(undefined, { maximumFractionDigits: 1 })
                    : totalValue.toLocaleString(undefined, { maximumFractionDigits: 1 })}
                </text>
                {displayHover && (
                  <text
                    x={200}
                    y={235}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize="11"
                    fontWeight="semibold"
                    fill={displayHover.color || textMuted}
                  >
                    {displayHover.percent.toFixed(1)}%
                  </text>
                )}
              </g>
            )}

            {/* Semicircle Gauge Center Details */}
            {chartType === "semi" && (
              <g pointerEvents="none">
                <circle cx={200} cy={220} r={170 * 0.45} fill={surfaceBg} />
                <text
                  x={200}
                  y={200}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize="12"
                  fontWeight="medium"
                  fill={textMuted}
                >
                  {displayHover?.name || "Total"}
                </text>
                <text
                  x={200}
                  y={218}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize="18"
                  fontWeight="extrabold"
                  fill={textColor}
                >
                  {displayHover?.numericValue
                    ? displayHover.numericValue.toLocaleString(undefined, { maximumFractionDigits: 1 })
                    : totalValue.toLocaleString(undefined, { maximumFractionDigits: 1 })}
                </text>
              </g>
            )}
          </svg>
        )}
      </Box>

      {/* Selected / Hovered Detail Card */}
      {hoveredSlice && (
        <Flex
          bg={useColorModeValue("gray.50", "rgba(255,255,255,0.06)")}
          p={3}
          borderRadius="xl"
          align="center"
          justify="space-between"
          borderWidth="1px"
          borderColor={borderColor}
        >
          <HStack spacing={3}>
            <Box w={3.5} h={3.5} borderRadius="full" bg={hoveredSlice.color} />
            <Text fontWeight="bold" fontSize="sm" color={textColor}>
              {hoveredSlice.name || "Untitled Row"}
            </Text>
          </HStack>
          <HStack spacing={4}>
            <Text fontSize="sm" color={textColor} fontWeight="semibold">
              {hoveredSlice.numericValue.toLocaleString()}
            </Text>
            <Badge colorScheme="blue" fontSize="xs" borderRadius="md">
              {hoveredSlice.percent.toFixed(1)}%
            </Badge>
          </HStack>
        </Flex>
      )}

      {/* Legend */}
      {showLegend && slices.length > 0 && (
        <Flex wrap="wrap" gap={3} pt={2} borderTop="1px" borderColor={borderColor}>
          {slices.map((slice) => (
            <HStack
              key={slice.id || slice.origIndex}
              spacing={2}
              p={1.5}
              px={2.5}
              borderRadius="lg"
              cursor="pointer"
              bg={hoveredSlice?.id === slice.id ? useColorModeValue("gray.100", "whiteAlpha.200") : "transparent"}
              _hover={{ bg: useColorModeValue("gray.50", "whiteAlpha.100") }}
              onMouseEnter={() => setHoveredSlice(slice)}
              onMouseLeave={() => setHoveredSlice(null)}
            >
              <Box w={3} h={3} borderRadius="full" bg={slice.color} flexShrink={0} />
              <Text fontSize="xs" fontWeight="medium" color={textColor} maxW="110px" isTruncated>
                {slice.name || "Unnamed"}
              </Text>
              <Text fontSize="xs" color={textMuted}>
                {slice.percent.toFixed(0)}%
              </Text>
            </HStack>
          ))}
        </Flex>
      )}
    </VStack>
  );
};
