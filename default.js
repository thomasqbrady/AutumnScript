let previousCommand = '', timer = null, mouseTimer = null;
let inputVolume = 60;

Autumn.setStatusMenuItems([
  {
    title: 'Maximize', onClick() {
      Window.focusedWindow().maximize();
  } },
  { title: 'Center', onClick() { center() } },
  { title: 'Left', onClick() { setWindow('left') } },
  { title: 'Right', onClick() { setWindow('right') } },
  { title: 'Top', onClick() { setWindow('up') } },
  { title: 'Bottom', onClick() { setWindow('down') }}
]);

const cmdOptShift: ModString[] = ['command', 'option', 'shift']
const cmdShift: ModString[] = ['command', 'shift']

// Restart Autumn (sometimes useful when switching monitors)
Hotkey.activate(cmdOptShift, 'z', () => {
  Notification.post({
    title: 'Restarting',
    subtitle: 'Restarting Autumn',
    body: 'Restart initiated'
  });
  let error = Shell.runSync('killall Autumn & open /Applications/Autumn.app & wait %1 %2');
  console.log(error);
});

// Restart WiFi
Hotkey.activate(cmdOptShift, 'w', () => {
  Notification.post({
    title: 'Restarting WiFi'
  });
  let error = Shell.runSync('networksetup -setairportpower en0 off');
  console.log(error);
  error = Shell.runSync('networksetup -setairportpower en0 on');
  console.log(error);
});

// Mute toggle
Hotkey.activate(cmdOptShift, '0', () => {
  let output = Shell.runSync("osascript -e 'input volume of (get volume settings)'");
  let volumeStr = output.stdout;
  let currentVolume = parseInt(volumeStr.substr(0, volumeStr.indexOf("\n")), 10);
  console.log(`Current volume: ${currentVolume}`);
  if (currentVolume < 5) {
    console.log('Unmuting');
    Notification.post({
      title: 'Un-muting'
    });
    console.log(`Setting input volume to ${inputVolume}`);
    let output = Shell.runSync(`osascript -e "set volume input volume ${inputVolume}"`);
    console.log(output);
  } else {
    console.log('Muting');
    Notification.post({
      title: 'Muting'
    });
    let output = Shell.runSync(`osascript -e "set volume input volume 0"`);
    inputVolume = currentVolume;
    console.log(output);
  }
});

// Switch to USB input/output
Hotkey.activate(cmdOptShift, '9', () => {
  Notification.post({
    title: 'Switching to USB audio'
  });
  let output = Shell.runSync(`/usr/local/Cellar/switchaudio-osx/1.0.0/SwitchAudioSource -t input -s "USB audio CODEC"`);
  console.log(output);
  output = Shell.runSync(`/usr/local/Cellar/switchaudio-osx/1.0.0/SwitchAudioSource -t output -s "USB audio CODEC"`);
  console.log(output);
});

// Switch to AirPods input/output
Hotkey.activate(cmdOptShift, '8', () => {
  Notification.post({
    title: 'Switching to AirPods'
  });
  let output = Shell.runSync(`/usr/local/Cellar/switchaudio-osx/1.0.0/SwitchAudioSource -t input -s "Thomas’s AirPods Pro"`);
  console.log(output);
  output = Shell.runSync(`/usr/local/Cellar/switchaudio-osx/1.0.0/SwitchAudioSource -t output -s "Thomas’s AirPods Pro"`);
  console.log(output);
});

// Maximize the window
Hotkey.activate(cmdOptShift, 'm', () => {
  Window.focusedWindow().maximize();
});

// Center the window on screen (toggles sizes)
Hotkey.activate(cmdOptShift, 'c', () => {
  center();
});

function center() {
  let percent = 0.65;
  switch (previousCommand) {
    case 'centerA' :
      percent = 0.85;
      previousCommand = 'centerB';
      break;
    case 'centerB' :
      percent = 0.45;
      previousCommand = 'centerC';
      break;
    case 'centerC' :
    default :
      percent = 0.65;
      previousCommand = 'centerA';
      break;
  }
  if (!Window.focusedWindow()) {
    return null;
  }
  Window.focusedWindow().moveToPercentOfScreen({
    x: (1 - percent) / 2,
    y: 0.0,
    width: percent,
    height: percent,
  })
});

function moveToUnit(x, y, width, height) {
  Window.focusedWindow().moveToPercentOfScreen({
    x, y, width, height
  });
}

// Toggles for taking up halves/quarters of screens 
// (hit once with left key to get a window half the width of your display, 
// twice to get a window that fills the left half of your display)
function setWindow(command) {
  if (!Window.focusedWindow()) {
    return null;
  }
  let screenRect = Screen.currentScreen().innerFrame();
  let s = Screen.currentScreen();
  let w = Window.focusedWindow();
  let winRect = w.size();
  switch (command) {
    case 'up':
      switch (previousCommand) {
        case 'upA':
          moveToUnit(0, 0, 1, 0.5);
          previousCommand = 'upB';
          break;
        case 'upB':
        default:
          w.setSize({ height: Math.round(screenRect.height / 2), width: winRect.width });
          w.setPosition({ x: w.position().x, y: 0 });
          previousCommand = 'upA';
          break;
      }
      break;
    case 'down':
      switch (previousCommand) {
        case 'downA':
          moveToUnit(0, 0.5, 1, 0.5);
          previousCommand = 'downB';
          break;
        case 'downB':
        default:
          w.setSize({ height: Math.round(screenRect.height / 2), width: winRect.width });
          w.setPosition({ x: w.position().x, y: Math.round(screenRect.height / 2) });
          previousCommand = 'downA';
          break;
      }
      break;
    case 'left':
      switch (previousCommand) {
        case 'leftA':
          moveToUnit(0, 0, 0.5, 1);
          previousCommand = 'leftB';
          break;
        case 'leftB':
        default:
          w.setSize({ height: winRect.height, width: Math.round(screenRect.width / 2) });
          w.setPosition({ x: 0, y: 0 });
          previousCommand = 'leftA';
          break;
      }
      break;
    case 'right':
      switch (previousCommand) {
        case 'rightA':
          moveToUnit(0.5, 0, 0.5, 1);
          previousCommand = 'rightB';
          break;
        case 'rightB':
        default:
          w.setSize({ height: winRect.height, width: Math.round(screenRect.width / 2) });
          w.setPosition({ x: Math.round(screenRect.width / 2), y: 0 });
          previousCommand = 'rightA';
          break;
      }
      break;
  }
  if (timer) {
    clearTimeout(timer);
  }
  timer = setTimeout(() => {
    previousCommand = '';
    clearTimeout(timer);
  }, 5000);
}

// Try pressing Cmd+Opt+Ctrl and arrow keys
Hotkey.activate(cmdOptShift, 'up',
  () => { setWindow('up') });
Hotkey.activate(cmdOptShift, 'down',
  () => { setWindow('down') });
Hotkey.activate(cmdOptShift, 'left',
  () => { setWindow('left') });
Hotkey.activate(cmdOptShift, 'right',
  () => { setWindow('right') });
