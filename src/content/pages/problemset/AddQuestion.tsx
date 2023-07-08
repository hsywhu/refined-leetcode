import { css } from 'styled-components/macro'
import Popper from '@/components/PopperUnstyled'
import { useHover, useAppSelector, useAppDispatch } from '@/hooks'
import {
  forwardRef,
  MouseEventHandler,
  ReactNode,
  useEffect,
  useMemo,
  useState,
} from 'react'
import {
  fetchFavoriteDetails,
  selectFavoriteIdsByCategory,
} from '../problem-list/favoriteSlice'

import Item from './Item'
import Wrap from '../problem-list/FavoriteWrap'
import { parseParamsToBody } from './utils'
import store from '@/app/store'
import { selectQuestonsByOption } from './questionsSlice'

const getCurrentId = () => {
  const paths = location.pathname.split('/').filter(Boolean)
  if (paths[0] === 'problem-list') return paths[1]
  return ''
}

interface BoxProps {
  children: ReactNode
  onClick?: MouseEventHandler<HTMLDivElement>
}

export const Box = forwardRef<HTMLDivElement, BoxProps>(function Box(
  { children, onClick },
  ref
) {
  const handleClicl: MouseEventHandler<HTMLDivElement> = e =>
    onClick && onClick(e)
  return (
    <div
      ref={ref}
      css={css`
        display: flex;
        height: 32px;
        align-items: center;
        margin-right: 10px;
        padding: 0 10px;
        cursor: pointer;
        border-radius: 5px;
        background-color: ${props =>
          props.theme.mode === 'dark' ? '#ffffff1a' : '#000a200d'};
        box-shadow: ${props =>
          props.theme.mode === 'dark'
            ? css`rgba(0, 0, 0, 0) 0px 0px 0px 0px,
  rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0.24) 0px 1px 3px 0px,
  rgba(0, 0, 0, 0.16) 0px 2px 8px 0px`
            : css`rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0.04) 0px 1px 3px 0px, rgba(0, 0, 0, 0.08) 0px 2px 8px 0px`};
        &:hover {
          background-color: ${props =>
            props.theme.mode === 'dark' ? '#ffffff24' : '#000a201a'};
        }
      `}
      onClick={handleClicl}
    >
      {children}
    </div>
  )
})

const AddQuestion: React.FC = () => {
  const [bindRef, hover, ref] = useHover(100)
  const [bindPopperRef, , popperRef] = useHover(100)
  const [openPopper, setOpenPopper] = useState(false)
  const ids = useAppSelector(selectFavoriteIdsByCategory('custom'))
  const allIds = useAppSelector(state => state.favorites.ids)
  const [currentId, setCurrentId] = useState(getCurrentId())
  const dispatch = useAppDispatch()

  const questions = useMemo(() => {
    const body = parseParamsToBody()
    const { data } = selectQuestonsByOption(store.getState(), {
      ...body,
      skip: 0,
      limit: Infinity,
    })
    const questions = data.problemsetQuestionList.questions
    return questions
  }, [
    JSON.stringify({
      ...parseParamsToBody(),
      skip: 0,
      limit: Infinity,
    }),
    allIds,
  ])

  useEffect(() => {
    if (!allIds.includes(currentId)) {
      dispatch(fetchFavoriteDetails([currentId]))
    }
  }, [currentId])

  useEffect(() => {
    const handleUrlChange = () => {
      setCurrentId(getCurrentId())
    }
    window.addEventListener('urlchange', handleUrlChange)
    return () => {
      window.removeEventListener('urlchange', handleUrlChange)
    }
  }, [])

  const toggleOpen: React.MouseEventHandler<HTMLDivElement> = e => {
    e.stopPropagation()
    setOpenPopper(open => !open)
  }
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const el = e.target as Node
      if (!popperRef.current?.contains(el) && !ref.current?.contains(el)) {
        setOpenPopper(false)
      }
    }

    document.addEventListener('mousedown', handleClick, { capture: true })
    return () =>
      document.removeEventListener('mousedown', handleClick, { capture: true })
  }, [])
  return (
    <>
      {/* <ToolTip
        title={`将当前筛选出的题目添加到题单中`}
        placement="top"
        open={hover}
      >
        <Box ref={bindRef} onClick={toggleOpen}>
          <SvgIcon>
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
          </SvgIcon>
        </Box>
      </ToolTip> */}
      {openPopper && (
        <Popper
          anchorEl={ref.current}
          ref={bindPopperRef}
          placement="bottom"
          offset={{ top: -6, left: 0 }}
        >
          <div
            css={css`
              width: 300px;
            `}
          >
            <Wrap expanded={true} showAdd={true}>
              <div
                css={css`
                  display: flex;
                  align-items: center;
                  justify-content: center;
                `}
              >
                当前选中题目：
                <span
                  css={css`
                    color: red;
                    margin: 0 5px;
                    font-weight: bold;
                  `}
                >
                  {questions.length}
                </span>
                道
              </div>
              <ul
                css={css`
                  max-height: 400px;
                  overflow: auto;
                  user-select: text;
                `}
              >
                {ids.map(idHash => (
                  <Item
                    key={idHash}
                    idHash={idHash}
                    current={currentId === idHash}
                  />
                ))}
              </ul>
            </Wrap>
          </div>
        </Popper>
      )}
    </>
  )
}

export default AddQuestion
