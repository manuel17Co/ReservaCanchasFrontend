import Campo3Tab from '@/src/components/Campo3Tab';
import CanchasTab from '@/src/components/CanchasTab';
import SedesTab from '@/src/components/SedesTab';
import React, { useState } from 'react';
import { View, useWindowDimensions } from 'react-native';
import { SceneMap, TabBar, TabView } from 'react-native-tab-view';

const renderScene = SceneMap({
  canchas: CanchasTab,
  sedes: SedesTab,
  campo3: Campo3Tab,
});

const routes = [
  { key: 'canchas', title: 'Canchas' },
  { key: 'sedes', title: 'Sedes' },
  { key: 'campo3', title: 'Campo 3' },
];

export default function CanchasTabs() {
  const layout = useWindowDimensions();
  const [index, setIndex] = useState(0);

  return (
    <View style={{ flex: 1 , paddingTop: 20}}>
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: layout.width }}
        renderTabBar={(props) => (
          <TabBar
            {...props}
            indicatorStyle={{ backgroundColor: '#007AFF' }}
            style={{ backgroundColor: '#fff'}}
            activeColor="#007AFF"
            inactiveColor="#999"
          />
        )}
      />
    </View>
  );
}

