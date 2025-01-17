var diaperLoop = null;         // Keeps a hold of the loop so it can be exited at any time easily
var messChance;
var wetChance;
var diaperTimerBase;
var regressionLevel;
var desperationLevel;
var diaperTimerModifier;

// Start listening for chat inputs
function bcdwStartListening()
{
    try
    {
        ServerSocket.on("ChatRoomMessage", bcdw);
    }
    catch(error)
    {
        setTimeout(bcdwStartListening, 500);
    }
}
bcdwStartListening();

// Destutter speach. Needed for interations with other mods
function destutter(string)
{
    // Step over every character in the string
    for (var i = 0 ; i < string.length - 2 ; i++)
    {
        if (string.at(i+1) === "-" && string.at(i) === string.at(i+2))
        {
            console.log(string.at(i));
            string = string.substring(0, i) + string.substring(i+2, string.length);
        }
    }
  return string;
}

// Chat handeler
function bcdw(data)
{
    // First, make sure there's actually something to read
    if (data)
    {
        // Check to see if a milk bottle is used on the user
        if (
            data.Type === "Action" &&
            data.Content === "ActionUse" &&
            data.Dictionary[1]?.Tag === "DestinationCharacter" &&
            data.Dictionary[1]?.MemberNumber === Player.MemberNumber &&
            data.Dictionary[2]?.AssetName === "MilkBottle"
        )
        {
            setDesperation();
        }

        // Starts the script running
        if 
        (
            destutter(data?.Content).startsWith("->diaper") &&
            (data.Type === "Chat" || data.Type === "Whisper")
        )
        {
            // Parse out data into a queue for easier processing
            let chatCommand = data?.Content.toLowerCase().split(" ");
            chatCommand.shift();

            // Send to command parser
            bcdwCommands(chatCommand.reverse(), data.Sender, data.Type);
        }
    }
}

// Command handler
function bcdwCommands(chatCommand, callerID, type)
{
    console.log("BCDW caught command");
    console.log(chatCommand);
    // Commands only the user can use
    if (callerID === Player.MemberNumber)
    {
        // Start the script
        if (chatCommand[chatCommand.length-1] === "start")
        {
            // Check to see if other arguments have been passed as well (default regression level, desperation, or use levels)
            chatCommand.pop()

            // Parse arguments for command
            let commandArguments = ["wetchance", "messchance", "desperation", "regression", "timer", "wetpanties", "messpanties", "wetchastity", "messchastity"];
            let caughtArguments = BCDWCONST?.diaperDefaultValues;
            while (commandArguments.includes(chatCommand[chatCommand.length-1]))
            {
                let tempVal = chatCommand.pop();
                switch (tempVal)
                {
                    case commandArguments[0]:
                        caughtArguments.initWetChance = (isNaN(chatCommand[chatCommand.length-1])) ? BCDWCONST?.diaperDefaultValues.wetChance : chatCommand[chatCommand.length-1];
                        break;
                    case commandArguments[1]:
                        caughtArguments.initMessChance = (isNaN(chatCommand[chatCommand.length-1])) ? BCDWCONST?.diaperDefaultValues.messChance : chatCommand[chatCommand.length-1];
                        break;
                    case commandArguments[2]:
                        caughtArguments.initDesperationLevel = (isNaN(chatCommand[chatCommand.length-1])) ? BCDWCONST?.diaperDefaultValues.desperationLevel : chatCommand[chatCommand.length-1];
                        break;
                    case commandArguments[3]:
                        caughtArguments.initRegressionLevel = (isNaN(chatCommand[chatCommand.length-1])) ? BCDWCONST?.diaperDefaultValues.regressionLevel : chatCommand[chatCommand.length-1];
                        break;
                    case commandArguments[4]:
                        caughtArguments.baseTimer = (isNaN(chatCommand[chatCommand.length-1])) ? BCDWCONST?.diaperDefaultValues.baseTimer : chatCommand[chatCommand.length-1];
                        break;
                    case commandArguments[5]:
                        caughtArguments.initWetLevelInner = (isNaN(chatCommand[chatCommand.length-1])) ? BCDWCONST?.diaperDefaultValues.wetLevelInner : chatCommand[chatCommand.length-1];
                        break;
                    case commandArguments[6]:
                        caughtArguments.initMessLevelInner = (isNaN(chatCommand[chatCommand.length-1])) ? BCDWCONST?.diaperDefaultValues.messLevelInner : chatCommand[chatCommand.length-1];
                        break;
                    case commandArguments[7]:
                        caughtArguments.initWetLevelOuter = (isNaN(chatCommand[chatCommand.length-1])) ? BCDWCONST?.diaperDefaultValues.wetLevelOuter : chatCommand[chatCommand.length-1];
                        break;
                    case commandArguments[8]:
                        caughtArguments.initMessLevelOuter = (isNaN(chatCommand[chatCommand.length-1])) ? BCDWCONST?.diaperDefaultValues.messLevelOuter : chatCommand[chatCommand.length-1];
                        break;
                }
                chatCommand.pop();
            }
            diaperWetter(caughtArguments);
        }

        // End the script
        else if (chatCommand[chatCommand.length-1] === "stop")
        {
            stopWetting();
        }
    }
    // Chat commands that can be executed by other people
    {
        // Filter to make sure the command is targeted at the user
        if (chatCommand[chatCommand.length-2] === Player.MemberNumber || type === "Whisper" || callerID === Player.MemberNumber)
        {
            // Change into a fresh diaper
            if (chatCommand[chatCommand.length-1] === "change")
            {
                chatCommand.pop();

                // Get rid of the member number in case that was passed
                if (chatCommand[chatCommand.length-1] === Player.MemberNumber)
                {
                    chatCommand.pop();
                }

                // See if you should be changing both or just one of the diaper (and which one, of course)
                if (chatCommand[chatCommand.length-1] === "panties")
                {
                    if (!checkForDiaper("panties"))
                    {
                        ServerSend("ChatRoomChat", {Type: "Action", Content: "gag", Dictionary: [{Tag: "gag", Text: tmpname + " doesn't have a diaper there!"}]});
                    }
                    else
                    {
                        refreshDiaper({cdiaper: "panties"});
                    }
                }
                else if (chatCommand[chatCommand.length-1] === "chastity")
                {
                    if (!checkForDiaper === "chastity")
                    {
                        ServerSend("ChatRoomChat", {Type: "Action", Content: "gag", Dictionary: [{Tag: "gag", Text: tmpname + " doesn't have a diaper there!"}]});
                    }
                    else
                    {
                        refreshDiaper({cdiaper: "chastity"});
                    }
                }
                else
                {
                    if (!(checkForDiaper("panties") || checkForDiaper("chastity")))
                    {
                        ServerSend("ChatRoomChat", {Type: "Action", Content: "gag", Dictionary: [{Tag: "gag", Text: tmpname + " doesn't have a diaper! Get one on her before she makes a mess!"}]});
                    }
                    else
                    {
                        refreshDiaper({cdiaper: "both"});
                    }
                }
            }
        }
    }
    // Commands that can be executed by anyone
    if (chatCommand[chatCommand.length-1] === "help") {
        chatCommand.pop();

        let commandArguments = ["start", "change", "stop"];
        let tempVal = chatCommand.pop();
        switch (tempVal)
        {
            case commandArguments[0]:
                ServerSend("ChatRoomChat", {Type: "Action", Content: "gag", Dictionary: [{Tag: "gag", Text: BCDWCONST?.diaperHelpMessages.start}]});
                break;
            case commandArguments[1]:
                ServerSend("ChatRoomChat", {Type: "Action", Content: "gag", Dictionary: [{Tag: "gag", Text: BCDWCONST?.diaperHelpMessages.change}]});
                break;
            case commandArguments[2]:
                ServerSend("ChatRoomChat", {Type: "Action", Content: "gag", Dictionary: [{Tag: "gag", Text: BCDWCONST?.diaperHelpMessages.stop}]});
                break;
            default:
                ServerSend("ChatRoomChat", {Type: "Action", Content: "gag", Dictionary: [{Tag: "gag", Text: BCDWCONST?.diaperHelpMessages.default}]});
                break;
        }
    }
}

// Initializer function
function diaperWetter( 
    {
        initMessChance = BCDWCONST?.diaperDefaultValues.messChance,
        initWetChance = BCDWCONST?.diaperDefaultValues.wetChance,
        baseTimer = BCDWCONST?.diaperDefaultValues.baseTimer,
        initRegressionLevel = BCDWCONST?.diaperDefaultValues.regressionLevel,
        initDesperationLevel = BCDWCONST?.diaperDefaultValues.desperationLevel,
        initMessLevelInner = BCDWCONST?.diaperDefaultValues.messLevelInner,
        initWetLevelInner = BCDWCONST?.diaperDefaultValues.wetLevelInner,
        initMessLevelOuter = BCDWCONST?.diaperDefaultValues.messLevelOuter,
        initWetLevelOuter = BCDWCONST?.diaperDefaultValues.wetLevelOuter
    } = {}
)
{
    // Greating message
    if (Player.Nickname == '') { 
        var tmpname = Player.Name;
    } else {
        var tmpname = Player.Nickname;
    }
    ServerSend("ChatRoomChat", {Type: "Action", Content: "gag", Dictionary: [{Tag: "gag", Text: "Say hello to the little baby " + tmpname + "!"}]});

    // Initial clear.
    refreshDiaper(
    {
        cdiaper: "both",
        inMessLevelChastity: (initMessLevelOuter < 0 || initMessLevelOuter > 2) ? 
            BCDWCONST?.diaperDefaultValues.messLevelOuter : 
            initMessLevelOuter,
        inWetLevelChastity: (initWetLevelOuter < 0 || initWetLevelOuter > 2) ? 
            ((initMessLevelOuter < 0 || initMessLevelOuter > 2) ? 
                BCDWCONST?.diaperDefaultValues.messLevelOuter : 
                inMessLevelOuter
            ) : 
            ((initWetLevelOuter > initMessLevelOuter) ? 
                initWetLevelOuter : 
                ((initMessLevelOuter < 0 || initMessLevelOuter > 2) ? 
                    BCDWCONST?.diaperDefaultValues.messLevelOuter : 
                    initMessLevelOuter
                )
            ),
        inMessLevelPanties: (initMessLevelInner < 0 || initMessLevelInner > 2) ? 
            BCDWCONST?.diaperDefaultValues.messLevelInner : 
            initMessLevelInner,
        inWetLevelPanties: (initWetLevelInner < 0 || initWetLevelInner > 2) ? 
            ((initMessLevelInner < 0 || initMessLevelInner > 2) ? 
                BCDWCONST?.diaperDefaultValues.messLevelInner : 
                initMessLevelOuter
            ) : 
            ((initWetLevelInner > initMessLevelInner) ? 
                initWetLevelInner : 
                ((initMessLevelInner < 0 || initMessLevelInner > 2) ? 
                    BCDWCONST?.diaperDefaultValues.messLevelInner : 
                    initMessLevelInner
                )
            ),
    });
    messChance = initMessChance;
    wetChance = initWetChance;
    diaperTimerBase = baseTimer;   // The default amount of time between ticks in minutes
    regressionLevel = initRegressionLevel;// Used for tracking how much the user has regressed (affects the timer)
    desperationLevel = initDesperationLevel;// Used for tracking how recently a milk bottle has been used (affects the timer)
    

    // Handle modifiers
    diaperTimerModifier = 1;    // We will divide by the modifier (positive modifiers decrease the timer)
    diaperTimerModifier = manageRegression(diaperTimerModifier);
    diaperTimerModifier = manageDesperation(diaperTimerModifier);
    diaperTimer = diaperTimerBase / diaperTimerModifier;

    // Go into main loop
    diaperRunning = true;           // Helps with the kill switch
    checkTick();
}

// Changes how long it takes between ticks (in minutes)
function changeDiaperTimer(delay)
{
    // Bound the delay to between 2 minutes and 1 hour
    if (delay < 2) { delay = 2; }
    else if (delay > 60) { delay = 60; }

    diaperTimerBase = delay;        // Updates diaperTimerBase
}

// Refresh the diaper settings so wet and mess levels are 0. Pass "chastity", "panties", or "both" so only the correct diaper gets reset.
function refreshDiaper(
    {
        cdiaper = "both",
        inWetLevelPanties = BCDWCONST?.diaperDefaultValues.wetLevelInner,
        inMessLevelPanties =  BCDWCONST?.diaperDefaultValues.messLevelInner,
        inWetLevelChastity = BCDWCONST?.diaperDefaultValues.wetLevelOuter,
        inMessLevelChastity = BCDWCONST?.diaperDefaultValues.messLevelOuter,
    } = {}
)
{
    if (Player.Nickname == '') { 
        var tmpname = Player.Name;
    } else {
        var tmpname = Player.Nickname;
    }
    if (InventoryGet(Player, "Pronouns").Asset.Name == "HeHim")  {
        var tmpr1 = "He";
        var tmpr2 = "him";
        var tmpr3 = "his";
	var tmpr4 = "he";
    } else {
        var tmpr1 = "She";
        var tmpr2 = "her";
        var tmpr3 = "her";
	var tmpr4 = "she";
    }
    DiaperChangeMessages = {
        "ChangeDiaperInner": " has gotten a fresh inner diaper.",
        "ChangeDiaperOuter": " has gotten a fresh outer diaper.",
        "ChangeDiaperOnly": " has gotten a fresh diaper.",
        "ChangeDiaperBoth": " has gotten a fresh pair of diapers."
    };
    if (cdiaper === "both")
    {
        MessLevelPanties = inMessLevelPanties;
        WetLevelPanties = inWetLevelPanties;
        MessLevelChastity = inMessLevelChastity;
        WetLevelChastity = inWetLevelChastity;
        changeDiaperColor("ItemPelvis");
        changeDiaperColor("Panties");
        if (checkForDiaper("Panties") && checkForDiaper("ItemPelvis"))
        {
            ServerSend("ChatRoomChat", {Type: "Action", Content: "gag", Dictionary: [{Tag: "gag", Text: tmpname + DiaperChangeMessages["ChangeDiaperBoth"]}]});
        }
        else if ((checkForDiaper("Panties") && !checkForDiaper("ItemPelvis")) || (checkForDiaper("ItemPelvis") && !checkForDiaper("Panties")))
        {
            ServerSend("ChatRoomChat", {Type: "Action", Content: "gag", Dictionary: [{Tag: "gag", Text: tmpname + DiaperChangeMessages["ChangeDiaperOnly"]}]});
        }
    }
    else if (cdiaper === "chastity")
    {
        MessLevelChastity = inMessLevelChastity;
        WetLevelChastity = inWetLevelChastity;
        changeDiaperColor("ItemPelvis");
        if (checkForDiaper("ItemPelvis") && checkForDiaper("Panties"))
        {
            ServerSend("ChatRoomChat", {Type: "Action", Content: "gag", Dictionary: [{Tag: "gag", Text: tmpname + DiaperChangeMessages["ChangeDiaperOuter"]}]});
        }
        else if (checkForDiaper("ItemPelvis") && !checkForDiaper("Panties"))
        {
            ServerSend("ChatRoomChat", {Type: "Action", Content: "gag", Dictionary: [{Tag: "gag", Text: tmpname + DiaperChangeMessages["ChangeDiaperOnly"]}]});
        }
    }
    else if (cdiaper === "panties")
    {
        MessLevelPanties = inMessLevelPanties;
        WetLevelPanties = inWetLevelPanties;
        changeDiaperColor("Panties");
        if (checkForDiaper("ItemPelvis") && checkForDiaper("Panties"))
        {
            ServerSend("ChatRoomChat", {Type: "Action", Content: "gag", Dictionary: [{Tag: "gag", Text:tmpname + DiaperChangeMessages["ChangeDiaperOuter"]}]});
        }
        else if (checkForDiaper("Panties") && !checkForDiaper("ItemPelvis"))
        {
            ServerSend("ChatRoomChat", {Type: "Action", Content: "gag", Dictionary: [{Tag: "gag", Text: tmpname + DiaperChangeMessages["ChangeDiaperOnly"]}]});
        }
    }
}

// Check for if a diaper is in the Panties or ItemPelvies slot
function checkForDiaper(slot) 
{
    return InventoryGet(Player, slot)?.Asset?.Name === "PoofyDiaper" || InventoryGet(Player, slot)?.Asset?.Name === "BulkyDiaper";
}

// Checks to see if the user has a nursery milk equiped
function checkForNurseryMilk()
{
    return (InventoryGet(Player, "ItemMouth")?.Asset?.Name === "RegressedMilk") || (InventoryGet(Player, "ItemMouth2")?.Asset?.Name === "RegressedMilk") || (InventoryGet(Player, "ItemMouth3")?.Asset?.Name === "RegressedMilk");
}

// Checks for a normal milk bottle
function checkForMilk()
{
    return (InventoryGet(Player, "ItemMouth")?.Asset?.Name === "MilkBottle") || (InventoryGet(Player, "ItemMouth2")?.Asset?.Name === "MilkBottle") || (InventoryGet(Player, "ItemMouth3")?.Asset?.Name === "MilkBottle");
}

// Handles the regression counter
function manageRegression(diaperTimerModifier = 1)
{
    if (checkForNurseryMilk() && regressionLevel < 3)
    {
        regressionLevel++;
    }
    else if (!checkForNurseryMilk() && regressionLevel > 0)
    {
        regressionLevel--;
    }

    return diaperTimerModifier * Math.pow(2, regressionLevel);
}

// Sets the users desperationLevel to 3 when they are given a milk bottle
function setDesperation()
{
    desperationLevel = 3;
}

// Handles "desperateness" aka how recently a milk bottle was drunk
function manageDesperation(diaperTimerModifier = 1)
{
    // If they don't have a milk bottle anymore
    if (!checkForMilk())
    {
        // Decrease desperationLevel to a minimum of zero if no milk is found
        desperationLevel = (desperationLevel != 0) ? desperationLevel - 1 : 0;
    }
    return diaperTimerModifier * (desperationLevel+1);
}

// Updates the color of a diaper
function changeDiaperColor(slot)
{
    if (slot === "ItemPelvis" && checkForDiaper(slot))
    {
        InventoryWear(
            Player, 
            InventoryGet(Player, slot)?.Asset?.Name,
            slot,
            [
                InventoryGet(Player, slot)?.Color[0],
                BCDWVari?.DiaperUseLevels[MessLevelChastity][WetLevelChastity-MessLevelChastity],
                InventoryGet(Player, slot)?.Color[2],
                InventoryGet(Player, slot)?.Color[3]
            ],
            InventoryGet(Player, slot)?.Difficulty,
            Player.MemberNumber
        );
    }
    else if (slot === "Panties" && checkForDiaper(slot))
    {
        InventoryWear(
            Player, 
            InventoryGet(Player, slot)?.Asset?.Name,
            slot,
            [
                InventoryGet(Player, slot)?.Color[0],
                BCDWVari?.DiaperUseLevels[MessLevelPanties][WetLevelPanties-MessLevelPanties],
                InventoryGet(Player, slot)?.Color[2],
                InventoryGet(Player, slot)?.Color[3]
            ],
            InventoryGet(Player, slot)?.Difficulty,
            Player.MemberNumber
        );
    }
}

// Command to stop the script from running
function stopWetting()
{
    console.log("See you next time!");
    diaperRunning = false;
    clearTimeout(diaperLoop);
    checkTick();
}

// Funcky while loop
function checkTick()
{
    // Terminate loop if the user isn't wearing a compatible diaper
    if((checkForDiaper("ItemPelvis") || checkForDiaper("Panties")) && diaperRunning === true)
    {
        // Wait for a bit
        diaperLoop = setTimeout(checkTick, diaperTimer*60*1000);
        // Go to main logic
        diaperTick();
    }
    else
    {
        if (Player.Nickname == '') { 
            var tmpname = Player.Name;
        } else {
            var tmpname = Player.Nickname;
        }
        diaperRunning = false;
        ServerSend("ChatRoomChat", {Type: "Action", Content: "gag", Dictionary: [{Tag: "gag", Text: "Awww, " + tmpname + " is all grown up!"}]});
    }
}

// Body function
// If the baby uses their diaper, it will make the front of their diaper look like it's been used
function diaperTick()
{
    // Handle modifiers
    if (Player.Nickname == '') { 
        var tmpname = Player.Name;
    } else {
        var tmpname = Player.Nickname;
    }
    if (InventoryGet(Player, "Pronouns").Asset.Name == "HeHim")  {
        var tmpr1 = "He";
        var tmpr2 = "him";
        var tmpr3 = "his";
	    var tmpr4 = "he";
    } else {
        var tmpr1 = "She";
        var tmpr2 = "her";
        var tmpr3 = "her";
	    var tmpr4 = "she";
    }
    DiaperUseMessages = {
        "MessInner": " has messed " + tmpr3 + " inner diaper.",
        "MessInnerFully": " has fully messed " + tmpr3 + " inner diaper.",
        "WetInner": " has wet " + tmpr3 + " inner diaper.",
        "WetInnerFully": " has fully wet " + tmpr3 + " inner diaper.",
        "MessOuter": " has messed " + tmpr3 + " outer diaper.",
        "MessOuterFully": " has fully messed " + tmpr3 + " outer diaper.",
        "WetOuter": " has wet " + tmpr3 + " outer diaper.",
        "WetOuterFully": " has fully wet " + tmpr3 + " outer diaper.",
        "MessOnly": " has messed " + tmpr3 + " diaper.",
        "MessOnlyFully": " has fully messed " + tmpr3 + " diaper.",
        "WetOnly": " has wet " + tmpr3 + " diaper.",
        "WetOnlyFully": " has fully " + tmpr3 + " her diaper."
    };
    var diaperTimerModifier = 1;    // We will divide by the modifier (positive modifiers decrease the timer)
    diaperTimerModifier = manageRegression(diaperTimerModifier);
    diaperTimerModifier = manageDesperation(diaperTimerModifier);
    diaperTimer = diaperTimerBase / diaperTimerModifier;

    testMess = Math.random();
    // If the baby messes, increment the mess level to a max of 2 and make sure that the wet level is at least as high as the mess level.
    if (testMess > 1-messChance)
    {
        if (MessLevelPanties === 2 || !checkForDiaper("Panties"))
        {
            MessLevelChastity = (MessLevelChastity < 2) ? MessLevelChastity + 1 : MessLevelChastity;
            WetLevelChastity = (WetLevelChastity < MessLevelChastity) ? MessLevelChastity : WetLevelChastity;
        }
        else if (checkForDiaper("Panties"))
        {
            MessLevelPanties = MessLevelPanties + 1;
            WetLevelPanties = (WetLevelPanties < MessLevelPanties) ? MessLevelPanties : WetLevelPanties;
        }

        // Display messages for when a diaper is messed.
        if ((MessLevelPanties === 2 && checkForDiaper("Panties") && !checkForDiaper("ItemPelvis")) || (MessLevelChastity === 2 && checkForDiaper("ItemPelvis") && !checkForDiaper("Panties")))
        {
            ServerSend("ChatRoomChat", {Type: "Action", Content: "gag", Dictionary: [{Tag: "gag", Text: tmpname + DiaperUseMessages["MessOnlyFully"]}]});
        }
        else if ((checkForDiaper("Panties") && !checkForDiaper("ItemPelvis")) || (checkForDiaper("ItemPelvis") && !checkForDiaper("Panties")))
        {
            ServerSend("ChatRoomChat", {Type: "Action", Content: "gag", Dictionary: [{Tag: "gag", Text: tmpname + DiaperUseMessages["MessOnly"]}]});
        }
        else if (MessLevelChastity === 0)
        {
            if (MessLevelPanties === 2)
            {
                ServerSend("ChatRoomChat", {Type: "Action", Content: "gag", Dictionary: [{Tag: "gag", Text: tmpname + DiaperUseMessages["MessInnerFully"]}]});
            }
            else if (MessLevelPanties === 1)
            {
                ServerSend("ChatRoomChat", {Type: "Action", Content: "gag", Dictionary: [{Tag: "gag", Text: tmpname + DiaperUseMessages["MessInner"]}]});
            }
        }
        else if (MessLevelChastity === 1)
        {
            ServerSend("ChatRoomChat", {Type: "Action", Content: "gag", Dictionary: [{Tag: "gag", Text: tmpname + DiaperUseMessages["MessOuter"]}]});
        }
        else if (MessLevelChastity === 2)
        {
            ServerSend("ChatRoomChat", {Type: "Action", Content: "gag", Dictionary: [{Tag: "gag", Text: tmpname + DiaperUseMessages["MessOuterFully"]}]});
        }
    }
    // If the baby only wets, increment the wet level to a max of 2.
    else if (testMess > 1-wetChance)
    {
        if (WetLevelPanties == 2 && (InventoryGet(Player, "Panties") !== "PoofyDiaper" && InventoryGet(Player, "Panties") !== "BulkyDiaper"))
        {
            WetLevelChastity = (WetLevelChastity < 2) ? WetLevelChastity + 1 : WetLevelChastity;
        }
        else
        {
            WetLevelPanties = WetLevelPanties + 1;
        }

        // Display messages for when a diaper is wet.
        if ((WetLevelPanties === 2 && checkForDiaper("Panties") && !checkForDiaper("ItemPelvis")) || (WetLevelChastity === 2 && checkForDiaper("ItemPelvis") && !checkForDiaper("Panties")))
        {
            ServerSend("ChatRoomChat", {Type: "Action", Content: "gag", Dictionary: [{Tag: "gag", Text: tmpname + DiaperUseMessages["MessOnlyFully"]}]});
        }
        else if ((checkForDiaper("Panties") && !checkForDiaper("ItemPelvis")) || (checkForDiaper("ItemPelvis") && !checkForDiaper("Panties")))
        {
            ServerSend("ChatRoomChat", {Type: "Action", Content: "gag", Dictionary: [{Tag: "gag", Text: tmpname + DiaperUseMessages["WetOnly"]}]});
        }
        else if (WetLevelChastity === 0)
        {
            if (WetLevelPanties === 2)
            {
                ServerSend("ChatRoomChat", {Type: "Action", Content: "gag", Dictionary: [{Tag: "gag", Text: tmpname + DiaperUseMessages["WetInnerFully"]}]});
            }
            else if (WetLevelPanties === 1)
            {
                ServerSend("ChatRoomChat", {Type: "Action", Content: "gag", Dictionary: [{Tag: "gag", Text: tmpname + DiaperUseMessages["WetInner"]}]});
            }
        }
        else if (WetLevelChastity === 1)
        {
            ServerSend("ChatRoomChat", {Type: "Action", Content: "gag", Dictionary: [{Tag: "gag", Text: tmpname + DiaperUseMessages["WetOuter"]}]});
        }
        else if (WetLevelChastity === 2)
        {
            ServerSend("ChatRoomChat", {Type: "Action", Content: "gag", Dictionary: [{Tag: "gag", Text: tmpname + DiaperUseMessages["WetOuterFully"]}]});
        }
    }
    // Don't update the color when it's not needed.
    else
    {
        return;
    }

    // Update color based on the DiaperUseLevels table.
    changeDiaperColor("ItemPelvis");
    changeDiaperColor("Panties");
    ChatRoomCharacterUpdate(Player); 
}
