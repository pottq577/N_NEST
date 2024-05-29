import React from 'react'
import Divider from '@mui/material/Divider'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction'
import IconButton from '@mui/material/IconButton'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import EmptyMessage from './EmptyMessage'

const renderProjectInfo = project => {
  const parts = []

  if (project.teamStructure) {
    parts.push(`${project.teamStructure}`)
  }
  if (project.teamMembers) {
    parts.push(`${project.teamMembers}`)
  }
  if (project.techStack) {
    parts.push(`${project.techStack}`)
  }
  if (project.isOpen) {
    parts.push(`${project.isOpen ? '오픈' : ''}`)
  }

  return parts.join(' · ')
}

const ListItemTextSecondary = ({ item }) => (
  <>
    {renderProjectInfo(item)}
    <br />
    {item.projectDescription && (
      <>
        &nbsp;&nbsp;- {item.projectDescription}
        <br />
      </>
    )}
    {item.mainTasks && (
      <>
        {item.mainTasks.split('\n').map((line, idx) => (
          <React.Fragment key={idx}>
            {idx === 0 ? (
              <>
                &nbsp;&nbsp;- {line}
                <br />
              </>
            ) : (
              <>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{line}
                <br />
              </>
            )}
          </React.Fragment>
        ))}
      </>
    )}
    {item.repoLink && (
      <>
        &nbsp;&nbsp;-{' '}
        <a href={item.repoLink} target='_blank' rel='noopener noreferrer'>
          {item.repoLink}
        </a>
        <br />
      </>
    )}
    {item.websiteLink && (
      <>
        &nbsp;&nbsp;-{' '}
        <a href={item.websiteLink} target='_blank' rel='noopener noreferrer'>
          {item.websiteLink}
        </a>
        <br />
      </>
    )}
    {item.androidLink && (
      <>
        &nbsp;&nbsp;-{' '}
        <a href={item.androidLink} target='_blank' rel='noopener noreferrer'>
          {item.androidLink}
        </a>
        <br />
      </>
    )}
    {item.iosLink && (
      <>
        &nbsp;&nbsp;-{' '}
        <a href={item.iosLink} target='_blank' rel='noopener noreferrer'>
          {item.iosLink}
        </a>
        <br />
      </>
    )}
  </>
)

const RenderList = ({ items, renderItemText, handleEdit, handleDelete, dividerCondition, isAdding, message }) => {
  if (isAdding) {
    return null
  }

  return (
    <>
      {items.length === 0 ? (
        <EmptyMessage message={message} />
      ) : (
        <List>
          {items.map((item, index) => (
            <React.Fragment key={index}>
              <ListItem>
                <ListItemText
                  primary={renderItemText(item, 'primary')}
                  secondary={
                    item.projectName ? <ListItemTextSecondary item={item} /> : renderItemText(item, 'secondary')
                  }
                />
                <ListItemSecondaryAction>
                  <IconButton edge='end' aria-label='edit' onClick={() => handleEdit(index)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton edge='end' aria-label='delete' onClick={() => handleDelete(index)}>
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
              {dividerCondition(items, index) && <Divider sx={{ my: 2 }} />}
            </React.Fragment>
          ))}
        </List>
      )}
    </>
  )
}

export default RenderList