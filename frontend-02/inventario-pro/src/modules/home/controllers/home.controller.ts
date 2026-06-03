import { useEffect, useState } from 'react';

import { usersService } from '../../users/services/users.service';
import { racksService } from '../../racks/services/racks.service';

export function useHomeController() {
  const [loading, setLoading] = useState(true);

  const [usersCount, setUsersCount] = useState(0);
  const [racksCount, setRacksCount] = useState(0);

  const [chartData, setChartData] = useState<any[]>([]);

  async function loadDashboard() {
    try {
      setLoading(true);

      const [users, racks] = await Promise.all([
        usersService.getAll(),
        racksService.getAll(),
      ]);

      setUsersCount(users.length);
      setRacksCount(racks.length);

      // gráfico fake baseado nos dados
      setChartData([
        {
          name: 'Seg',
          users: users.length - 2,
          racks: racks.length - 1,
        },
        {
          name: 'Ter',
          users: users.length - 1,
          racks: racks.length,
        },
        {
          name: 'Qua',
          users: users.length,
          racks: racks.length,
        },
        {
          name: 'Qui',
          users: users.length + 1,
          racks: racks.length,
        },
        {
          name: 'Sex',
          users: users.length + 2,
          racks: racks.length + 1,
        },
      ]);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  return {
    loading,
    usersCount,
    racksCount,
    chartData,
  };
}