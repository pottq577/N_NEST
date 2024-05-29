import { createContext, useContext, useState } from 'react'

const TeamContext = createContext(null)

export const useTeam = () => useContext(TeamContext)

export const TeamProvider = ({ children }) => {
  const [selectedTeams, setSelectedTeams] = useState([])

  const addTeam = team => {
    // 중복 지원 방지 로직: 이미 리스트에 같은 id의 팀이 있는지 확인
    const isAlreadyApplied = selectedTeams.some(t => t.id === team.id)
    if (!isAlreadyApplied) {
      const teamWithTime = {
        ...team,
        appliedTime: new Date() // 지원 시간 추가
      }
      setSelectedTeams(prev => [...prev, teamWithTime])

      return 'success'
    } else {
      return 'already_applied'
    }
  }

  return <TeamContext.Provider value={{ selectedTeams, addTeam }}>{children}</TeamContext.Provider>
}