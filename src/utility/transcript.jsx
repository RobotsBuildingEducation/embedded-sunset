// Answered the questions on the foundations of frontend software development on https://embedded-rox.app

import { CuteGradient } from "../elements/CuteGradient";
import { RobotDialogue } from "../elements/RoboticDialogue";

export let transcript = {
  tutorial: {
    address:
      "naddr1qq84xatwwdjhgt25w46x7unfv9kqyg9ty9kqftakjrsw5p55z5nnsqwxld6xns5darqsrey7kqcuqrlz6upsgqqqw5usc665uz",
    name: "Sunset Tutorial",
    imgSrc:
      "https://res.cloudinary.com/dtkeyccga/image/upload/v1743209424/FFFEF5_d4weow.png",
  },
  1: {
    address:
      "naddr1qqgyyctnd93hxt20vck5xmmyd9hxwqg5waehxw309aex2mrp0yhxgctdw4eju6t0qgs2kgtvqjhmdy8qagrfg9f88qqud7m5d8pgm6xpq8jfavp3cq8794crqsqqqafezxftsn",
    name: "Basics of Coding",
    imgSrc:
      "https://image.nostr.build/5a08c9f63e86a2e06ae0dc15417c6fe938a382d558566c05bfcaee82a9ab96c6.png",
  },
  2: {
    address:
      "naddr1qqd57cn2v43hgt20wf5k2mn5v4jz65rjdanhyctdd45kueczyz4jzmqy47mfpc82q62p2fecq8r0karfc2x73sgpuj0tqvwqpl3dwqcyqqq82wgsg5rma",
    name: "Object-Oriented Programming",
    imgSrc:
      "https://image.nostr.build/97b490e4c2392d42e9e2b8cc4cc62048b270f7c40b03116a6ce9969faaef86ef.png",
  },
  3: {
    address:
      "naddr1qq2yvun0de6x2mny94zx2an9d3hhqmt9de6qyg9ty9kqftakjrsw5p55z5nnsqwxld6xns5darqsrey7kqcuqrlz6upsgqqqw5us2mkysa",
    name: "Frontend Development",
    imgSrc:
      "https://image.nostr.build/77a1d3735d2515ba9b0918b43aec2f257e19185c0befa9783f4ddc02b531ec8e.png",
  },
  4: {
    address:
      "naddr1qqsyyctrddjkuepdg4hxw6twv4jhy6twvuk5vatwv3sk6etww3skcuczyz4jzmqy47mfpc82q62p2fecq8r0karfc2x73sgpuj0tqvwqpl3dwqcyqqq82wg9g36d7",
    name: "Backend Engineering Fundamentals",
    imgSrc:
      "https://image.nostr.build/7953556c3cf75118ea71eb7e4a5136cf1bd7d4c71d38e334fdd86d307ba6e557.png",
  },
  5: {
    address:
      "naddr1qqw5xun9v96xjmn894qhqurn94skuepdg4u8qetjd9jkucm9wvpzp2epdsz2ld5sur4qd9q4yuuqr3hmw35u9r0gcyq7f84sx8qqlckhqvzqqqr48ycrw3hn",
    name: "Creating Apps & Experiences",
    imgSrc:
      "https://image.nostr.build/01f19276f12efaf42165769f5b1bca8e4f78b0e9393e93445dcba183e978dfe5.png",
  },
  6: {
    address:
      "naddr1qqgyxmmdwp6hgetj94fkx6t9de3k2q3q4vskcp90k6gwp6sxjs2jwwqpcmahg6wz3h5vzq0yn6crrsq0uttsxpqqqp6njk0gx39",
    name: "Computer Science",
    imgSrc:
      "https://image.nostr.build/d0a6f66c3633223b04310fa04e2241e3d6bda17fcab1695e87d7062668b1de75.png",
  },
};

export let videoTranscript = {
  tutorial: {
    address:
      "naddr1qqd5jmn5wfhkgatrw35k7m3dw3hj63twva5kuet9wf5kueczyz4jzmqy47mfpc82q62p2fecq8r0karfc2x73sgpuj0tqvwqpl3dwqcyqqq82wg6gh4ut",
    name: "Introduction to Engineering",
    imgSrc:
      "https://res.cloudinary.com/dtkeyccga/image/upload/v1691640391/ROBE_assets/Module_Buttons_1_ixnitr_scjfyk.gif",
    videoSrc:
      "https://res.cloudinary.com/dqykr1jh0/video/upload/v1711495708/symr6pztmtpkzn5aqq2r.mp4",
    practice: {
      steps: [
        {
          code: "console.log('Hello World!')",
          knowledge: (
            <RobotDialogue
              text={
                <p>
                  🎛️ Professionally, it's used to communicate data between
                  systems like errors or other important messages.
                </p>
              }
              background="lightyellow"
            />
          ),
          guidance: (
            <RobotDialogue text="Print a welcome message to start your engineering journey." />
          ),
        },
      ],
      reward: <div>Hello world!</div>,
      displayCode: `console.log("Hello world!");`,
    },
  },
  1: {
    address:
      "naddr1qqdysatdv9hz6sm0d4c82ar9wgk5jmn5v4exzcm5d9hkuq3q4vskcp90k6gwp6sxjs2jwwqpcmahg6wz3h5vzq0yn6crrsq0uttsxpqqqp6njcqp0u5",
    name: "Human-Computer Interaction",
    imgSrc:
      "https://image.nostr.build/e53c3c3068ff4e83071b62fa6e487ddcb7f36bc68cdf6c762181d98fcc3b931b.gif",
    videoSrc:
      "https://res.cloudinary.com/sheilfer/video/upload/v1697403810/IMG_8966_gt4s4s.mov",
    practice: {
      steps: [
        {
          code: 'const accessibility = {\n  visualUsers: "navigation and buttons",\n  screenReaders: "organized information",\n  benefit: "universal design improvements"\n};',
          guidance: (
            <RobotDialogue text="Define an object that represents key accessibility considerations in design. This helps us think about how different users interact with our applications." />
          ),
          knowledge: (
            <RobotDialogue
              text={
                <p>
                  🎯 Accessibility is about creating inclusive designs that work
                  for everyone. Screen readers need well-organized information,
                  while visual users need clear navigation. When we design for
                  accessibility, it often improves the experience for all users!
                </p>
              }
              background="lightyellow"
            />
          ),
        },
        {
          code: 'const designPrinciples = [\n  "Research with users",\n  "Consider accessibility",\n  "Follow heuristics",\n  "Create design systems"\n];',
          guidance: (
            <RobotDialogue text="Create an array of core design principles we learned about. These form the foundation of good interaction design." />
          ),
          knowledge: (
            <RobotDialogue
              text={
                <p>
                  🎨 Design is multidisciplinary! It combines user research,
                  accessibility considerations, proven guidelines (heuristics),
                  and systematic approaches to create effective solutions.
                  Remember: the best design makes people happy!
                </p>
              }
              background="lightyellow"
            />
          ),
        },
        {
          code: 'function improveUX(product) {\n  return {\n    research: "Interview users",\n    test: "Create prototypes",\n    iterate: "Gather feedback",\n    implement: "Make improvements"\n  };\n}',
          guidance: (
            <RobotDialogue text="Define a function that outlines the UX improvement process. This represents the cyclical nature of design work." />
          ),
          knowledge: (
            <RobotDialogue
              text={
                <p>
                  🔄 UX improvement is an ongoing cycle: we research with real
                  users, test our ideas with prototypes, gather feedback, and
                  make improvements. This process helps us create better
                  products and experiences!
                </p>
              }
              background="lightyellow"
            />
          ),
        },
      ],
      reward: (
        <div>
          Congratulations! You now understand the key concepts of UI/UX design:
          <br />
          - Accessibility as a foundation <br />
          - The importance of user research <br />- Following design principles
          <br />- Creating systematic solutions
        </div>
      ),
      displayCode: `
// UI/UX Design Principles
const designProcess = {
  research: "Talk to real users",
  accessibility: "Design for everyone",
  heuristics: "Follow proven guidelines",
  systems: "Create scalable solutions"
};

// The key to good design is making users happy!`,
    },
  },
  2: {
    address:
      "naddr1qqv9qun0vaexzmtdd9hxwt2xw4hxgctdv4h8gctvwvqs6amnwvaz7tmwdaejumr0dspzp2epdsz2ld5sur4qd9q4yuuqr3hmw35u9r0gcyq7f84sx8qqlckhqvzqqqr48yvtlh0x",
    name: "Programming Fundamentals",
    imgSrc:
      "https://image.nostr.build/5382632756fff26c8581ed053c29950d5a5bf7a3a0984a3db8fc71484f54d8bf.gif",
    videoSrc:
      "https://res.cloudinary.com/sheilfer/video/upload/v1693470075/CODING_LESSON_1_OOP_COMPRESSED_rnyagi_jalk2h.mov",
    practice: {
      impact: 750,
      action: `practice`,
      icon: `🥋`,
      request: `Let's practice!`,
      context: `We're going to practice defining a class and create an object.`,
      steps: [
        {
          code: "require axios from 'axios';",
          guidance: (
            <RobotDialogue text="This line imports the Axios library for making HTTP requests." />
          ),
          knowledge: (
            <RobotDialogue
              text={
                <p>
                  🌐 Axios is like a digital messenger. It helps our code talk
                  to the internet, sending requests and getting responses, just
                  like sending texts through a phone!
                </p>
              }
              background="lightyellow"
            />
          ),
        },
        {
          code: `class ChatGPTAPI { 
constructor(apiKey) {`,
          guidance: (
            <RobotDialogue text="Start of the ChatGPTAPI class definition and its constructor, initializing the API key." />
          ),
          knowledge: (
            <RobotDialogue
              text={
                <p>
                  🔧 This is like starting to build a robot. The constructor is
                  where we put in the initial parts, like the apiKey, which is
                  like a special password for our robot to access OpenAI's cool
                  features.
                </p>
              }
              background="lightyellow"
            />
          ),
        },
        {
          code: `this.apiKey = apiKey;`,
          guidance: (
            <RobotDialogue text="Assigns the passed apiKey to this instance of the class." />
          ),
          knowledge: (
            <RobotDialogue
              text={
                <p>
                  🔑 Here we're giving our robot the apiKey. It's a bit like
                  giving a secret code to a friend, so they can enter a VIP
                  area!
                </p>
              }
              background="lightyellow"
            />
          ),
        },
        {
          code: `this.endpoint = 'https://api.openai.com/v1/engines/davinci-codex/completions';`,
          guidance: (
            <RobotDialogue text="Sets the API endpoint for the ChatGPT API calls." />
          ),
          knowledge: (
            <RobotDialogue
              text={
                <p>
                  📡 Setting the endpoint is like telling our robot where to go
                  in the huge world of the internet to find the OpenAI engine, a
                  super-intelligent AI!
                </p>
              }
              background="lightyellow"
            />
          ),
        },
        {
          code: `this.headers = {
'Content-Type': 'application/json',
'Authorization': \`Bearer \${this.apiKey}\`
};`,
          guidance: (
            <RobotDialogue text="Configures the headers for HTTP requests, including the Content-Type and Authorization with the API key." />
          ),
          knowledge: (
            <RobotDialogue
              text={
                <p>
                  📃 Think of headers as a way of dressing up our message. It
                  tells OpenAI how we're sending the data ('Content-Type') and
                  proves who we are ('Authorization') using our secret code!
                </p>
              }
              background="lightyellow"
            />
          ),
        },
        {
          code: "}",
          guidance: <RobotDialogue text="End of the constructor." />,
          knowledge: (
            <RobotDialogue
              text={
                <p>
                  🛠️ That's the end of the robot's setup. Our constructor has
                  finished putting all the basic parts together, and now our
                  robot is ready to work!
                </p>
              }
              background="lightyellow"
            />
          ),
        },
        {
          code: `async query(prompt) {`,
          guidance: (
            <RobotDialogue text="Start of the 'query' method which will be used to send requests." />
          ),
          knowledge: (
            <RobotDialogue
              text={
                <p>
                  🤖 The 'query' method is like teaching our robot a new skill.
                  It's how our robot will talk to OpenAI, sending a prompt and
                  waiting for a smart response, all while doing other tasks too!
                </p>
              }
              background="lightyellow"
            />
          ),
        },
        {
          code: `const payload = { prompt };`,
          guidance: (
            <RobotDialogue text="Creates the payload for the request, containing the prompt." />
          ),
          knowledge: (
            <RobotDialogue
              text={
                <p>
                  📦 The payload is like a package of information. Here, we're
                  wrapping our question (prompt) nicely before our robot sends
                  it off to OpenAI.
                </p>
              }
              background="lightyellow"
            />
          ),
        },
        {
          code: `const headers = { headers: this.headers };`,
          guidance: (
            <RobotDialogue text="Sets up the headers for the request." />
          ),
          knowledge: (
            <RobotDialogue
              text={
                <p>
                  ✉️ We're making sure our robot uses the correct 'headers'
                  again. It's like putting the right stamp on a letter so it
                  gets to the right place with the right introduction.
                </p>
              }
              background="lightyellow"
            />
          ),
        },
        {
          code: `const response = await axios.post(this.endpoint, payload, headers);`,
          guidance: (
            <RobotDialogue text="Makes an asynchronous POST request to the ChatGPT API endpoint with the payload and headers." />
          ),
          knowledge: (
            <RobotDialogue
              text={
                <p>
                  🌟 Using 'axios.post', our robot sends the package (payload)
                  to OpenAI (endpoint). 'Await' means our robot will wait
                  patiently for the reply without stopping other tasks!
                </p>
              }
              background="lightyellow"
            />
          ),
        },
        {
          code: `let result = response.data.choices[0].text.trim();`,
          guidance: (
            <RobotDialogue text="Extracts and trims the text from the first choice in the response data." />
          ),
          knowledge: (
            <RobotDialogue
              text={
                <p>
                  📖 Once OpenAI replies, our robot reads the answer (response).
                  Just like picking the best part of a story, it chooses the
                  first response and cleans it up (trim), so it's neat and tidy
                  for us to understand.
                </p>
              }
              background="lightyellow"
            />
          ),
        },
        {
          code: "return result;",
          guidance: <RobotDialogue text="Returns the processed result." />,
          knowledge: (
            <RobotDialogue
              text={
                <p>
                  🌈 And now, our robot brings back the treasure – the response
                  from OpenAI. 'Return' is like saying, 'Here's the answer you
                  asked for!' It's the final step in our robot's task.
                </p>
              }
              background="lightyellow"
            />
          ),
        },
        {
          code: `} catch (err) {
    throw new Error(\`Failed: \${err}\`);
  }
}
}`,
          guidance: (
            <RobotDialogue text="Catch block for handling any errors during the API request, and the end of the 'query' method and class definition." />
          ),
          knowledge: (
            <RobotDialogue
              text={
                <p>
                  🚨 If something goes wrong, our robot is prepared. The 'catch'
                  part is like a safety net. If our robot encounters a problem
                  (error), it lets us know with a clear message, helping us fix
                  it!
                </p>
              }
              background="lightyellow"
            />
          ),
        },
      ],
      displayCode: `require axios from 'axios'

class ChatGPTAPI {
constructor(apiKey) {
  this.apiKey = apiKey;
  this.endpoint =
    'https://api.openai.com/v1/' +
    'engines/davinci-codex/' +
    'completions';
  this.headers = {
    'Content-Type': 'application/'
    +'json',
    'Authorization':
      \`Bearer \${this.apiKey}\`
  };
}

async query(prompt) {
  const payload = {
    prompt,
  }
  const headers = {
    headers: this.headers
  }
  try {
    const response = await axios
    .post(
      this.endpoint,
      payload,
      headers
    );

    let result = response
    .data
    .choices[0]
    .text
    .trim()

    return result
  } catch (err) {
    throw new Error(
      \`Failed: \${err}\`
    );
  }
}
}`,
      input: `require axios from 'axios'
class ChatGPTAPI {
constructor(apiKey) {
this.apiKey = apiKey;
this.endpoint =
'https://api.openai.com/v1/' +
'engines/davinci-codex/' +
completions';
this.headers = {
'Content-Type': 'application/'
+'json',
'Authorization':
\`Bearer \${this.apiKey}\`
};
}
async query(prompt) {
const payload = {
prompt,
}
const headers = {
headers: this.headers
}
try {
const response = await axios
.post(
this.endpoint,
payload,
headers
);
let result = response
.data
.choices[0]
.text
.trim()
return result
}catch (err) {
throw new Error(
\`Failed: \${err}\`
);
}
}
}`,
      response: <div>good job grasshopper!</div>,
      spanish: ``,
    },
  },
  3: {
    address:
      "naddr1qqw5vun0de6x2mny94fk7en5washyefdg4hxw6twv4jhy6twvuqs6amnwvaz7tmwdaejumr0dspzp2epdsz2ld5sur4qd9q4yuuqr3hmw35u9r0gcyq7f84sx8qqlckhqvzqqqr48ydcq5hu",
    name: "Frontend Software Engineering",
    imgSrc:
      "https://image.nostr.build/d31c13982ef101511c45ba9ee49bcdba8ebf50a000f27ce6bee4376682ba51ab.gif",
    videoSrc:
      "https://res.cloudinary.com/dtkeyccga/video/upload/v1691637324/v3/CODING_LESSON_2_FRONTEND_COMPRESSED_lc7u4p.mov",
    practice: {
      impact: 750,
      action: `practice`,
      icon: `🥋`,
      request: `Let's practice!`,
      context: `Let's create a cool background.`,
      reward: <CuteGradient />,
      steps: [
        {
          code: `import { useState, useEffect } from "react";`,
          guidance: <RobotDialogue text="Import React hooks." />,
          knowledge: (
            <RobotDialogue
              text={
                <p>
                  🌟 <strong>useState</strong> and <strong>useEffect</strong>{" "}
                  are special powers in React! <strong>useState</strong> lets
                  your component remember things, like a wizard's spellbook.
                  Each time you call it, you create a new memory (or state).{" "}
                  <strong>useEffect</strong> is like a magical assistant,
                  performing tasks (or effects) after your component appears or
                  changes, like sending messages or cleaning up. They make React
                  components really smart!
                </p>
              }
              background="lightgreen"
            />
          ),
        },
        {
          code: `export const CuteGradient = () => {`,
          guidance: <RobotDialogue text="Define CuteGradient component." />,
          knowledge: (
            <RobotDialogue
              text={
                <p>
                  🎨 Creating a new React component,{" "}
                  <strong>CuteGradient</strong>, is like painting a canvas. It’s
                  a self-contained piece of your app's UI, a little like
                  creating a new character in a story, complete with its own
                  state and behavior.
                </p>
              }
              background="lightgreen"
            />
          ),
        },
        {
          code: `const [offsetX, setOffsetX] = useState(0);
const [offsetY, setOffsetY] = useState(0);`,
          guidance: <RobotDialogue text="State for gradient offsets." />,
          knowledge: (
            <RobotDialogue
              text={
                <p>
                  💭 Think of <strong>useState(0)</strong> as setting a starting
                  point for a journey. Here, <strong>offsetX</strong> and{" "}
                  <strong>offsetY</strong> start at zero, like coordinates on a
                  treasure map, marking where the gradient's journey begins.
                </p>
              }
              background="lightgreen"
            />
          ),
        },
        {
          code: `useEffect(() => {
const startTime = Date.now();
const animateGradient = () => {
  const elapsedTime = Date.now() - startTime;
  setOffsetX(50 + 25 * Math.sin(elapsedTime * 0.001));
  setOffsetY(50 + 25 * Math.cos(elapsedTime * 0.0015));
  requestAnimationFrame(animateGradient);
};

requestAnimationFrame(animateGradient);
}, []);`,
          guidance: <RobotDialogue text="Animate gradient on mount." />,
          knowledge: (
            <RobotDialogue
              text={
                <p>
                  🕒 Here's where the magic happens! Using{" "}
                  <strong>useEffect</strong>, we start a clock (startTime) and
                  make our gradient dance using{" "}
                  <strong>requestAnimationFrame</strong>. It's like setting the
                  stage for a ballet, with the dancers (gradient) moving in a
                  pattern over time. The sin and cos functions create a smooth,
                  wave-like motion – a dance of colors!
                </p>
              }
              background="lightgreen"
            />
          ),
        },
        {
          code: `const gradientStyle = {
background: \`radial-gradient(circle at \${offsetX}% \${offsetY}%, pink, lightpink, hotpink, deepPink)\`,
width: "600px",
height: "400px",
};`,
          guidance: <RobotDialogue text="Define gradient style." />,
          knowledge: (
            <RobotDialogue
              text={
                <p>
                  🎨 This is where we dress up our gradient! Using style, we
                  paint a beautiful, moving background. The circle moves based
                  on our offsetX and offsetY – it's like giving life to our
                  canvas, making it vibrant and ever-changing.
                </p>
              }
              background="lightgreen"
            />
          ),
        },
        {
          code: `return <div style={gradientStyle}></div>`,
          guidance: <RobotDialogue text="Render gradient." />,
          knowledge: (
            <RobotDialogue
              text={
                <p>
                  🌈 Finally, we're showing off our beautiful gradient to the
                  world! By returning a <strong>div</strong> with our{" "}
                  <strong>gradientStyle</strong>, we're putting our moving,
                  colorful creation on display in our app – like hanging a
                  painting in a gallery for everyone to see.
                </p>
              }
              background="lightgreen"
            />
          ),
        },
        {
          code: `};`,
          guidance: <RobotDialogue text="End of component." />,
          knowledge: (
            <RobotDialogue
              text={
                <p>
                  🏁 And that's the end of our <strong>CuteGradient</strong>{" "}
                  component's journey! Just like closing a storybook, we close
                  our component, waiting to be opened and explored again when
                  the app runs.
                </p>
              }
              background="lightgreen"
            />
          ),
        },
      ],
      displayCode: `import { useState, useEffect } 
  from "react";

export const CuteGradient = () => {
  const [offsetX, setOffsetX] = 
    useState(0);
  const [offsetY, setOffsetY] = 
    useState(0);

  useEffect(() => {
    const startTime = Date.now();
    
    const animateGradient = () => {
      const elapsedTime = 
        Date.now() - startTime;
      setOffsetX(
        50 + 25 * 
        Math.sin(elapsedTime * 0.001)
      );
      setOffsetY(
        50 + 25 * 
        Math.cos(elapsedTime * 0.0015)
      );
      requestAnimationFrame(
        animateGradient
      );
    };

    requestAnimationFrame(animateGradient);
  }, []);

  const gradientStyle = {
    background: \`radial-gradient(
      circle at \${offsetX}% \${offsetY}%,
      pink, lightpink, hotpink, 
      deepPink
    )\`,
    width: "600px",
    height: "400px",
  };

  return <div style={gradientStyle}></div>
};`,
      input: `import { useState, useEffect }
from "react";
export const CuteGradient = () => {
const [offsetX, setOffsetX] =
useState(0);
const [offsetY, setOffsetY] =
useState(0);
useEffect(() => {
const startTime = Date.now();
const animateGradient = () => {
const elapsedTime =
Date.now() - startTime;
setOffsetX(
50 + 25 *
Math.sin(elapsedTime * 0.001)
);
setOffsetY(
50 + 25 *
Math.cos(elapsedTime * 0.0015)
);
requestAnimationFrame(
animateGradient
);
};
requestAnimationFrame(
animateGradient
);
}, []);
const gradientStyle = {
background: \`radial-gradient(
circle at
\${offsetX}%
\${offsetY}%,
pink, lightpink, hotpink,
deepPink
)\`,
width: "600px",
height: "400px",
};
return <div style={gradientStyle}>
</div>;
};`,
      response: <div>good job grasshopper!</div>,
      spanish: ``,
    },
  },
  4: {
    address:
      "naddr1qqwyyctrddjkuepd2dhkvarhv9ex2t29denkjmn9v4exjmn8qy28wumn8ghj7un9d3shjtnyv9kh2uewd9hsyg9ty9kqftakjrsw5p55z5nnsqwxld6xns5darqsrey7kqcuqrlz6upsgqqqw5usmqzt5r",
    name: "Backend Software Engineering",
    imgSrc:
      "https://res.cloudinary.com/dtkeyccga/image/upload/v1691640379/ROBE_assets/Module_Buttons_5_vulvwr_oymbfb.gif",
    videoSrc:
      "https://res.cloudinary.com/dtkeyccga/video/upload/v1691637319/v3/CODING_LESSON_3_BACKEND_COMPRESSED_qzpnwg.mov",
    practice: {
      impact: 750,
      action: `practice`,
      icon: `🥋`,
      request: `Let's practice!`,
      context: `Let's take a look at how OpenAI works.`,
      steps: [
        {
          code: `const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const { Configuration, OpenAIApi } = require("openai");`,
          guidance: <RobotDialogue text="Import dependencies." />,
          knowledge: (
            <RobotDialogue
              text={
                <p>
                  🌟 We're gathering all the tools we need. Think of these as
                  ingredients for a magic potion. Each one, like Firebase
                  functions, Express, and OpenAI, has a special role in our
                  coding recipe!
                </p>
              }
              background="lightblue"
            />
          ),
        },
        {
          code: `dotenv.config();`,
          guidance: <RobotDialogue text="Initialize dotenv." />,
          knowledge: (
            <RobotDialogue
              text={
                <p>
                  🔮 Dotenv is like a secret spell book. It holds important
                  secrets (environment variables) that our app can use, but
                  keeps them safe from prying eyes!
                </p>
              }
              background="lightblue"
            />
          ),
        },
        {
          code: `const configuration = new Configuration({
apiKey: process.env.OPENAI_API_KEY
});`,
          guidance: <RobotDialogue text="Set up OpenAI configuration." />,
          knowledge: (
            <RobotDialogue
              text={
                <p>
                  🗝️ Here we're setting up a special key (API key) for OpenAI.
                  It's like getting a VIP pass into the world of advanced AI,
                  allowing us to talk to OpenAI's powerful brain!
                </p>
              }
              background="lightblue"
            />
          ),
        },
        {
          code: `const openai = new OpenAIApi(configuration);`,
          guidance: <RobotDialogue text="Initialize OpenAIApi." />,
          knowledge: (
            <RobotDialogue
              text={
                <p>
                  🧠 Creating an OpenAIApi object is like waking up a robot with
                  the brain of OpenAI. Now, our app can ask it to do smart
                  things!
                </p>
              }
              background="lightblue"
            />
          ),
        },
        {
          code: `const app = express();`,
          guidance: <RobotDialogue text="Create Express app." />,
          knowledge: (
            <RobotDialogue
              text={
                <p>
                  🏗️ Express is our tool for building the app's structure. It's
                  like constructing a spaceship that'll travel on the internet
                  highways!
                </p>
              }
              background="lightblue"
            />
          ),
        },
        {
          code: `app.use(cors());
app.use(express.json());
app.use(bodyParser.json());`,
          guidance: <RobotDialogue text="Configure middleware." />,
          knowledge: (
            <RobotDialogue
              text={
                <p>
                  🔧 Setting up middleware in Express is like adding special
                  features to our spaceship. CORS lets it travel safely between
                  different web planets, and bodyParser helps it understand the
                  language of JSON, a common web language.
                </p>
              }
              background="lightblue"
            />
          ),
        },
        {
          code: `app.post("/prompt", async (req, res) => {`,
          guidance: <RobotDialogue text="Define /prompt endpoint." />,
          knowledge: (
            <RobotDialogue
              text={
                <p>
                  🌐 Here, we're creating a special spot (/prompt) in our app
                  where others can send us messages. When they do, our app knows
                  how to respond, thanks to the code we write here.
                </p>
              }
              background="lightblue"
            />
          ),
        },
        {
          code: `const prompt = req.body.prompt;`,
          guidance: <RobotDialogue text="Get prompt from request." />,
          knowledge: (
            <RobotDialogue
              text={
                <p>
                  📩 When someone sends us a message (request), we carefully
                  pick out the important part (prompt). It's like getting a
                  letter and finding the question inside it.
                </p>
              }
              background="lightblue"
            />
          ),
        },
        {
          code: `const completion = await openai.createChatCompletion({
model: "gpt-4",
messages: [{ role: "user", content: prompt }],
});`,
          guidance: <RobotDialogue text="Call OpenAI API." />,
          knowledge: (
            <RobotDialogue
              text={
                <p>
                  🤖 We're asking our OpenAI robot to think about the prompt and
                  give us a smart answer. 'await' means we'll wait patiently for
                  the answer, like waiting for a wise friend to reply to an
                  important question.
                </p>
              }
              background="lightblue"
            />
          ),
        },
        {
          code: `res.status(200).send({ bot: completion.data.choices[0].message });`,
          guidance: <RobotDialogue text="Send API response." />,
          knowledge: (
            <RobotDialogue
              text={
                <p>
                  📬 Once OpenAI's robot gives us the answer, we send it back to
                  whoever asked us. It's like returning a friend's call with the
                  information they wanted.
                </p>
              }
              background="lightblue"
            />
          ),
        },
        {
          code: `} catch (error) {
res.status(500).send({ error });
} });`,
          guidance: <RobotDialogue text="Handle errors." />,
          knowledge: (
            <RobotDialogue
              text={
                <p>
                  🚑 This part is like our app's emergency response. If
                  something unexpected happens, we send an SOS (500 status),
                  telling the user that we've hit a snag. It's crucial for
                  knowing when and where things might have gone wrong!
                </p>
              }
              background="lightblue"
            />
          ),
        },
        {
          code: `exports.app = functions.https.onRequest(app);`,
          guidance: <RobotDialogue text="Export app as Firebase function." />,
          knowledge: (
            <RobotDialogue
              text={
                <p>
                  🌍 Finally, we're sharing our spaceship (app) with the world
                  through Firebase. By exporting it, our app becomes a part of
                  the internet, ready to respond to users' requests from
                  anywhere on Earth, just like a satellite!
                </p>
              }
              background="lightblue"
            />
          ),
        },
      ],
      displayCode: `const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const { 
Configuration, 
OpenAIApi 
} = require("openai");

dotenv.config();

const configuration = new Configuration({
apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

const app = express();

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

app.post("/prompt", async (req, res) => {
try {
  const prompt = req.body.prompt;
  const completion = await openai
    .createChatCompletion({
      model: "gpt-4",
      messages: [
        { role: "user", content: prompt }
      ],
    });
  res.status(200).send({
    bot: completion.data.choices[0]
      .message,
  });
} catch (error) {
  res.status(500).send({ error });
}
});

exports.app = functions
.https
.onRequest(app);`,
      input: `const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const {
Configuration,
OpenAIApi
} = require("openai");
dotenv.config();
const configuration = new Configuration({
apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);
const app = express();
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.post("/prompt", async (req, res) => {
try {
const prompt = req.body.prompt;
const completion = await openai
.createChatCompletion({
model: "gpt-4",
messages: [
{ role: "user", content: prompt }
],
});
res.status(200).send({
bot: completion.data.choices[0]
.message,
});
} catch (error) {
res.status(500).send({ error });
}
});
exports.app = functions
.https
.onRequest(app);`,
      response: <div>good job grasshopper!</div>,
      spanish: ``,
    },
  },
  5: {
    address:
      "naddr1qq05vatvdskhxarpvd4j65m0ve68wctjv5k52mn8d9hx2etjd9hxwqg5waehxw309aex2mrp0yhxgctdw4eju6t0qgs2kgtvqjhmdy8qagrfg9f88qqud7m5d8pgm6xpq8jfavp3cq8794crqsqqqafelgxgc0",
    name: "Full-stack Software Engineering",
    imgSrc:
      "https://image.nostr.build/b28e1ff7e80344e5d34ab62b2edbc61dcb14cb88e95cdf5e74a7dcfcb8fd7ce4.gif",
    videoSrc:
      "https://res.cloudinary.com/dtkeyccga/video/upload/v1691867426/v3/CODING_LESSON_4_BUILD_APPS_COMPRESSED_ewvr2c.mov",

    practice: {
      impact: 750,
      action: `practice`,
      icon: `🥋`,
      request: `Let's practice!`,
      context: `Let's wire up OpenAI to create a user experience`,
      steps: [
        {
          code: `import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { auth, db } from './firebaseConfig';`,
          guidance: (
            <RobotDialogue text="Imports React, Axios, and Firebase configuration." />
          ),
          knowledge: (
            <RobotDialogue
              text={
                <p>
                  🌟 We're gathering magical tools for our coding journey! React
                  for building our web page, Axios for sending messages across
                  the internet, and Firebase for storing data and managing
                  users. It's like packing a backpack with all the essentials
                  for an adventure!
                </p>
              }
              background="lightblue"
            />
          ),
        },
        {
          code: `const OpenAIComponent = () => {`,
          guidance: <RobotDialogue text="Defines OpenAIComponent." />,
          knowledge: (
            <RobotDialogue
              text={
                <p>
                  🏗️ Here we start crafting a special part of our webpage, the
                  OpenAIComponent. It's like creating a magic portal where users
                  can interact with the powerful AI of OpenAI!
                </p>
              }
              background="lightblue"
            />
          ),
        },
        {
          code: `const [input, setInput] = useState('');
const [userId, setUserId] = useState(null);`,
          guidance: <RobotDialogue text="State hooks for input and userId." />,
          knowledge: (
            <RobotDialogue
              text={
                <p>
                  💭 <strong>useState</strong> is like creating a magic box
                  where we can store and change secret spells (data). Here, one
                  box holds user inputs, and another keeps track of the user's
                  identity. It's how our component remembers things!
                </p>
              }
              background="lightblue"
            />
          ),
        },
        {
          code: `useEffect(() => {
const unsubscribe = auth.onAuthStateChanged((user) => {
  if (user) {
    setUserId(user.uid);
  } else {
    setUserId(null);
  }
});

return () => unsubscribe();
}, []);`,
          guidance: (
            <RobotDialogue text="Effect for Firebase authentication state." />
          ),
          knowledge: (
            <RobotDialogue
              text={
                <p>
                  🌌 <strong>useEffect</strong> here is like a lookout tower. It
                  watches for changes in user status. When someone logs in or
                  out, it updates our magic box with their user ID or clears it
                  if they leave. The return part ensures we clean up when our
                  component is done!
                </p>
              }
              background="lightblue"
            />
          ),
        },
        {
          code: `const callOpenAI = async () => {
if (!userId) {
  console.log("User not logged in");
  return;
}
};`,
          guidance: <RobotDialogue text="Function to call OpenAI API." />,
          knowledge: (
            <RobotDialogue
              text={
                <p>
                  🤖 This function is like a spell caster. When activated, it
                  checks if we know the user (userId). If we do, it sends their
                  request off to OpenAI's brain, asking for wisdom or
                  creativity, and waits (async) for the magical response!
                </p>
              }
              background="lightblue"
            />
          ),
        },
        {
          code: `const saveToFirestore = async (userId, text) => {
const docRef = db.collection('users').doc(userId);
await docRef.collection('responses').add({
  generatedText: text,
  timestamp: new Date(),
});
};`,
          guidance: (
            <RobotDialogue text="Function to save response to Firestore." />
          ),
          knowledge: (
            <RobotDialogue
              text={
                <p>
                  📚 Here, we're like scribes, recording the stories told by
                  OpenAI. For each user, we create a new page in our digital
                  book (Firestore) and write down the AI's response with a time
                  stamp, preserving their interactions for posterity.
                </p>
              }
              background="lightblue"
            />
          ),
        },
        {
          code: `return (
  <div>
    <input 
      type="text" 
      value={input} 
      onChange={(e) => setInput(e.target.value)} 
    />
    <button onMouseDown={callOpenAI}>
      Generate and Save
    </button>
  </div>
);
};`,
          guidance: <RobotDialogue text="Component render method." />,
          knowledge: (
            <RobotDialogue
              text={
                <p>
                  🎨 This is where we bring our component to life visually. An
                  input box for users to type their questions, and a button that
                  activates our spell caster function. It's like setting up a
                  stage where users can interact with our magical OpenAI portal!
                </p>
              }
              background="lightblue"
            />
          ),
        },
        {
          code: `export default OpenAIComponent;`,
          guidance: <RobotDialogue text="Exports the component." />,
          knowledge: (
            <RobotDialogue
              text={
                <p>
                  🌍 By exporting OpenAIComponent, we're making it available for
                  use in other parts of our web adventure. It's like announcing,
                  'This magic portal is ready for anyone in our digital world to
                  use and explore the wonders of AI!' Now, our component can be
                  integrated into our app's larger story, ready to interact with
                  users and create amazing experiences.
                </p>
              }
              background="lightblue"
            />
          ),
        },
      ],
      displayCode: `import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { auth, db } from './firebaseConfig';

const OpenAIComponent = () => {
const [input, setInput] = useState('');
const [userId, setUserId] = useState(null);

useEffect(() => {
  const unsubscribe = auth.onAuthStateChanged((user) => {
    if (user) {
      setUserId(user.uid);
    } else {
      setUserId(null);
    }
  });

  // Clean up subscription
  return () => unsubscribe();
}, []);

const callOpenAI = async () => {
  if (!userId) {
    console.log("User not logged in");
    return;
  }

  const apiKey = process.env.REACT_APP_OPENAI_API_KEY;
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/engines/davinci-codex/completions',
      {
        prompt: input,
        max_tokens: 100,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': \`Bearer \${apiKey}\`,
        },
      }
    );
    const generatedText = response.data.choices[0].text;
    saveToFirestore(userId, generatedText);
  } catch (err) {
    console.error(err);
  }
};

const saveToFirestore = async (userId, text) => {
  const docRef = db.collection('users').doc(userId);
  await docRef.collection('responses').add({
    generatedText: text,
    timestamp: new Date(),
  });
};

return (
  <div>
    <input
      type="text"
      value={input}
      onChange={(e) => setInput(e.target.value)}
    />
    <button onMouseDown={callOpenAI}>
      Generate and Save
    </button>
  </div>
);
};

export default OpenAIComponent;`,
      input: `import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { auth, db } from './firebaseConfig';
const OpenAIComponent = () => {
const [input, setInput] = useState('');
const [userId, setUserId] = useState(null);
useEffect(() => {
const unsubscribe = auth.onAuthStateChanged((user) => {
if (user) {
setUserId(user.uid);
} else {
setUserId(null);
}
});
// Clean up subscription
return () => unsubscribe();
}, []);
const callOpenAI = async () => {
if (!userId) {
console.log("User not logged in");
return;
}
const apiKey = process.env.REACT_APP_OPENAI_API_KEY;
try {
const response = await axios.post(
'https://api.openai.com/v1/engines/davinci-codex/completions',
{
prompt: input,
max_tokens: 100,
},
{
headers: {
'Content-Type': 'application/json',
'Authorization': \`Bearer \${apiKey}\`,
},
}
);
const generatedText = response.data.choices[0].text;
saveToFirestore(userId, generatedText);
} catch (err) {
console.error(err);
}
};
const saveToFirestore = async (userId, text) => {
const docRef = db.collection('users').doc(userId);
await docRef.collection('responses').add({
generatedText: text,
timestamp: new Date(),
});
};
return (
<div>
<input
type="text"
value={input}
onChange={(e) => setInput(e.target.value)}
/>
<button onMouseDown={callOpenAI}>
Generate and Save
</button>
</div>
);
};
export default OpenAIComponent;`,
      response: <div>good job grasshopper!</div>,
      spanish: ``,
    },
  },
  6: {
    address:
      "naddr1qqw5vun0de6x2mny94fk7en5washyefdg4hxw6twv4jhy6twvuqs6amnwvaz7tmwdaejumr0dspzp2epdsz2ld5sur4qd9q4yuuqr3hmw35u9r0gcyq7f84sx8qqlckhqvzqqqr48ydcq5hu",
    name: "Data Structures & Algorithms",
    imgSrc:
      "https://image.nostr.build/71cafe3f065a4be64b6e51a9e8480ecbda8678bb7262637ed7f19dae0b75046d.gif",
    videoSrc:
      "https://res.cloudinary.com/sheilfer/video/upload/v1693469552/IMG_6826_ioqdfm_hxzxsl.mov",

    practice: {
      impact: 750,
      action: `practice`,
      icon: `🥋`,
      request: `Let's practice!`,
      context: `Let's write an algorithm a lot of computer science are challenged by`,
      steps: [
        {
          code: `function dijkstra(graph, start) {`,
          guidance: <RobotDialogue text="Start of dijkstra function." />,
          knowledge: (
            <RobotDialogue
              text={
                <p>
                  🌟 We're starting a journey with Dijkstra's algorithm, a way
                  to find the shortest path through a network, like finding the
                  quickest route on a map!
                </p>
              }
              background="lightblue"
            />
          ),
        },
        {
          code: `const visited = new Set();
const dist = {};`,
          guidance: (
            <RobotDialogue text="Initialize visited nodes and distances." />
          ),
          knowledge: (
            <RobotDialogue
              text={
                <p>
                  🏁 Here we set up checkpoints. 'visited' keeps track of where
                  we've been, and 'dist' is like our distance meter, measuring
                  how far we've gone.
                </p>
              }
              background="lightblue"
            />
          ),
        },
        {
          code: `for (let node in graph) {
dist[node] = Infinity;
}

dist[start] = 0;`,
          guidance: <RobotDialogue text="Set initial distances." />,
          knowledge: (
            <RobotDialogue
              text={
                <p>
                  📏 Setting up 'dist' with Infinity is like saying every place
                  is super far away, to start with. Then we set our starting
                  point to '0' – right where we are!
                </p>
              }
              background="lightblue"
            />
          ),
        },
        {
          code: `while (visited.size < Object.keys(graph).length) {`,
          guidance: <RobotDialogue text="Main loop for visiting nodes." />,
          knowledge: (
            <RobotDialogue
              text={
                <p>
                  🔄 This loop is our main journey. We'll keep exploring until
                  we've visited every place on our map (graph).
                </p>
              }
              background="lightblue"
            />
          ),
        },
        {
          code: `let minNode = getMinNode(dist, visited);`,
          guidance: <RobotDialogue text="Find the closest unvisited node." />,
          knowledge: (
            <RobotDialogue
              text={
                <p>
                  🔍 Here, we're looking for the nearest unvisited spot. It's
                  like choosing the closest next stop on our adventure.
                </p>
              }
              background="lightblue"
            />
          ),
        },
        {
          code: `visited.add(minNode);`,
          guidance: <RobotDialogue text="Mark the node as visited." />,
          knowledge: (
            <RobotDialogue
              text={
                <p>
                  ✅ Adding 'minNode' to 'visited' is like marking off a place
                  on our map that we've explored. We're leaving a trail of where
                  we've been!
                </p>
              }
              background="lightblue"
            />
          ),
        },
        {
          code: `for (let n in graph[minNode]) {
let alt = dist[minNode] + graph[minNode][n];
if (alt < dist[n]) {
  dist[n] = alt;
}
}`,
          guidance: <RobotDialogue text="Update distances for neighbors." />,
          knowledge: (
            <RobotDialogue
              text={
                <p>
                  🛣️ In this step, we're checking the paths to neighboring
                  spots. If we find a shorter route, we update our map with this
                  new, shorter distance – it's like finding a shortcut!
                </p>
              }
              background="lightblue"
            />
          ),
        },
        {
          code: `return dist; }`,
          guidance: <RobotDialogue text="Return final distances." />,
          knowledge: (
            <RobotDialogue
              text={
                <p>
                  🗺️ Returning 'dist' is like coming back from our adventure
                  with a map filled with the shortest routes to every place we
                  visited. It's a treasure map of knowledge!
                </p>
              }
              background="lightblue"
            />
          ),
        },
        {
          code: `function getMinNode(dist, visited) {`,
          guidance: (
            <RobotDialogue text="Start of getMinNode helper function." />
          ),
          knowledge: (
            <RobotDialogue
              text={
                <p>
                  🔍 'getMinNode' is our special tool for finding the next place
                  to visit. It looks through our distance map and picks the
                  closest spot we haven't been to yet.
                </p>
              }
              background="lightblue"
            />
          ),
        },
        {
          code: `let min = Infinity;
let minNode = null;`,
          guidance: <RobotDialogue text="Initialize min values." />,
          knowledge: (
            <RobotDialogue
              text={
                <p>
                  🌌 We start by assuming every unvisited place is infinitely
                  far away. 'minNode' is set to 'null', like an empty marker
                  waiting to find where to go next.
                </p>
              }
              background="lightblue"
            />
          ),
        },
        {
          code: `for (let node in dist) {
if (dist[node] < min && !visited.has(node)) {
  min = dist[node];
  minNode = node;
}
}`,
          guidance: (
            <RobotDialogue text="Determine the minimum distance node." />
          ),
          knowledge: (
            <RobotDialogue
              text={
                <p>
                  🕵️‍♂️ In this search, we're like detectives looking for the
                  closest next stop. We go through each node, and if it's closer
                  than what we've found so far and we haven't been there yet, it
                  becomes our new target. It's a process of elimination to find
                  the best route.
                </p>
              }
              background="lightblue"
            />
          ),
        },
        {
          code: `return minNode; }`,
          guidance: (
            <RobotDialogue text="Return the node with minimum distance." />
          ),
          knowledge: (
            <RobotDialogue
              text={
                <p>
                  🏁 Once we've found the closest unvisited node, we return it.
                  It's like choosing the next destination on our journey based
                  on which one is nearest to us.
                </p>
              }
              background="lightblue"
            />
          ),
        },
        {
          code: `const graph = {
A: { B: 1, C: 4 },
B: { A: 1, C: 2, D: 5 },
C: { A: 4, B: 2, D: 1 },
D: { B: 5, C: 1 }
};`,
          guidance: <RobotDialogue text="Define the graph." />,
          knowledge: (
            <RobotDialogue
              text={
                <p>
                  🌐 Here, we're creating our map (graph). Each letter
                  represents a place, and the numbers are the distances to other
                  places. It's like drawing a map with different routes and
                  their lengths between cities.
                </p>
              }
              background="lightblue"
            />
          ),
        },
        {
          code: `const dist = dijkstra(graph, 'A');
console.log(dist);`,
          guidance: (
            <RobotDialogue text="Execute dijkstra function and log output." />
          ),
          knowledge: (
            <RobotDialogue
              text={
                <p>
                  🚀 Finally, we put Dijkstra's algorithm to work! Starting from
                  'A', we discover the shortest paths to all other nodes.
                  Logging the result is like sharing the story of our journey –
                  the shortest paths we found from our starting point.
                </p>
              }
              background="lightblue"
            />
          ),
        },
      ],
      displayCode: `function dijkstra(graph, start) {
const visited = new Set();
const dist = {};

for (let node in graph) {
dist[node] = Infinity;
}

dist[start] = 0;

while (visited.size < 
      Object.keys(graph).length) {
let minNode = getMinNode(
  dist, visited
);

visited.add(minNode);

for (let n in graph[minNode]) {
  let alt = dist[minNode] + 
            graph[minNode][n];

  if (alt < dist[n]) {
    dist[n] = alt;
  }
}
}

return dist;
}

function getMinNode(dist, visited) {
let min = Infinity;
let minNode = null;

for (let node in dist) {
if (dist[node] < min && 
    !visited.has(node)) {
  min = dist[node];
  minNode = node;
}
}

return minNode;
}

const graph = {
A: { B: 1, C: 4 },
B: { A: 1, C: 2, D: 5 },
C: { A: 4, B: 2, D: 1 },
D: { B: 5, C: 1 }
};

const dist = dijkstra(graph, 'A');
console.log(dist);`,
      input: `function dijkstra(graph, start) {
const visited = new Set();
const dist = {};
for (let node in graph) {
dist[node] = Infinity;
}
dist[start] = 0;
while (visited.size <
      Object.keys(graph).length) {
let minNode = getMinNode(
  dist, visited
);
visited.add(minNode);
for (let n in graph[minNode]) {
  let alt = dist[minNode] +
            graph[minNode][n];
  if (alt < dist[n]) {
    dist[n] = alt;
  }
}
}
return dist;
}
function getMinNode(dist, visited) {
let min = Infinity;
let minNode = null;
for (let node in dist) {
if (dist[node] < min &&
    !visited.has(node)) {
  min = dist[node];
  minNode = node;
}
}
return minNode;
}
const graph = {
A: { B: 1, C: 4 },
B: { A: 1, C: 2, D: 5 },
C: { A: 4, B: 2, D: 1 },
D: { B: 5, C: 1 }
};
const dist = dijkstra(graph, 'A');
console.log(dist);`,
      response: <div>good job grasshopper!</div>,
      spanish: ``,
    },
  },
};

export let onboardingTranscript = {
  address:
    "naddr1qq95ueth94fhgatyv4h8gq3q4vskcp90k6gwp6sxjs2jwwqpcmahg6wz3h5vzq0yn6crrsq0uttsxpqqqp6njf9p4pl",
  name: {
    en: "New Student",
    es: "Nuevo Estudiante",
    "py-en": "New Student",
    "swift-en": "New Student",
    "android-en": "New Student",
    "compsci-en": "New Student",
    "nostr-en": "New Student",
  },
  imgSrc:
    "https://res.cloudinary.com/dtkeyccga/image/upload/v1745250135/bevfqeqakogfxrxn3pia.png",
};

export const computerScienceTranscript = {
  tutorial: {
    address:
      "naddr1qq84xatwwdjhgt25w46x7unfv9kqyg9ty9kqftakjrsw5p55z5nnsqwxld6xns5darqsrey7kqcuqrlz6upsgqqqw5usc665uz",
    name: "Sunset Tutorial",
    imgSrc:
      "https://res.cloudinary.com/dtkeyccga/image/upload/v1743209424/FFFEF5_d4weow.png",
  },
  1: {
    address:
      "naddr1qq0yvmm4dejxzarfdah8xtt0vck5gct5vyk4xarjw43hgatjv4esyg9ty9kqftakjrsw5p55z5nnsqwxld6xns5darqsrey7kqcuqrlz6upsgqqqw5us9rwzuz",
    name: "Foundations of Data Structures",
    imgSrc:
      "https://res.cloudinary.com/dtkeyccga/image/upload/v1751002201/paupyh0zktyippmr2cip.png",
  },
  2: {
    address:
      "naddr1qqtyc6twv4shyt2yv96xzt2nw3e82cm5w4ex2uczyz4jzmqy47mfpc82q62p2fecq8r0karfc2x73sgpuj0tqvwqpl3dwqcyqqq82wgk4m709",
    name: "Linear Data Structures",
    imgSrc:
      "https://res.cloudinary.com/dtkeyccga/image/upload/v1751002201/on6ho8qyvcafrdkhqc3n.png",
  },
  3: {
    address:
      "naddr1qqkys6t9wfshycmgd93kzmpdv9hxgt2pwdek7cmfv96xjan994zxzarp94fhgun4vd682un9wvpzp2epdsz2ld5sur4qd9q4yuuqr3hmw35u9r0gcyq7f84sx8qqlckhqvzqqqr48y8wp94d",
    name: "Hierarchical & Associative Data Structures",
    imgSrc:
      "https://res.cloudinary.com/dtkeyccga/image/upload/v1751002201/wgut7x4im1dlqjl4u3bo.png",
  },
  4: {
    address:
      "naddr1qqs9xmmjw35kueedv9hxgt2nv4shycmgd9hxwt2pd3nk7unfw35x6uczyz4jzmqy47mfpc82q62p2fecq8r0karfc2x73sgpuj0tqvwqpl3dwqcyqqq82wgth20th",
    name: "Sorting & Searching Algorithms",
    imgSrc:
      "https://res.cloudinary.com/dtkeyccga/image/upload/v1751002201/imrujm1fquuixyoi0rta.png",
  },
  5: {
    address:
      "naddr1qqwy7ur9wfshg6twvuk4x7tnw3jk6uedg4ehxetww35kzmrnqgs2kgtvqjhmdy8qagrfg9f88qqud7m5d8pgm6xpq8jfavp3cq8794crqsqqqafeuutaa8",
    name: "Operating Systems Essentials",
    imgSrc:
      "https://res.cloudinary.com/dtkeyccga/image/upload/v1751002201/j1eghlaqnlppqkfx1cem.png",
  },
  6: {
    address:
      "naddr1qqwy7ur9wfshg6twvuk4x7tnw3jk6uedg4ehxetww35kzmrnqgs2kgtvqjhmdy8qagrfg9f88qqud7m5d8pgm6xpq8jfavp3cq8794crqsqqqafeuutaa8",
    name: "Computer Science",
    imgSrc:
      "https://res.cloudinary.com/dtkeyccga/image/upload/v1751002201/j1eghlaqnlppqkfx1cem.png",
  },
};
