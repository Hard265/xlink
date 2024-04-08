import { CameraView } from 'expo-camera/next';
import { Modal, View } from 'react-native';

interface UserScannerProps {
  onScan: (scanningResult:  BarcodeScanningResult) => void;
  visible: boolean;
}

export default function UserScanner({visible=false, onScan}: UserScannerProps){
  
  return (
    <Modal visible={visible} animation='fade'>
      <CameraView className='flex-1' onBarcodeScanned={onScan}>
          <Pressable onPress={toggleCameraFacing}>
            <Text>Cancel</Text>
          </Pressable>
      </CameraView>
    </Modal>
  );
}
