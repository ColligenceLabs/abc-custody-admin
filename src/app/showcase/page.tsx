"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Palette,
  Zap,
  Sparkles,
  Star,
  Heart,
  Download,
  Play,
  Settings,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  TrendingUp,
  Shield,
  Rocket,
  Globe,
  ChevronDown,
  MoreHorizontal,
  Edit,
  Trash,
  Copy
} from "lucide-react"

export default function ShowcasePage() {
  const [progress, setProgress] = useState(33)

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full flex items-center justify-center" style={{backgroundColor: 'hsl(var(--sapphire-600))'}}>
                <Palette className="w-12 h-12 text-white" />
              </div>
              <div className="absolute -top-2 -right-2">
                <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center animate-pulse">
                  <Sparkles className="w-4 h-4 text-yellow-900" />
                </div>
              </div>
            </div>
          </div>

          <h1 className="text-5xl font-bold mb-4" style={{color: 'hsl(var(--sapphire-600))'}}>
            Sapphire UI 컴포넌트
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            현대적이고 아름다운 UI 컴포넌트들로 완성된 디자인 시스템
          </p>

          <div className="flex flex-wrap justify-center gap-3 mb-8">
            <Badge variant="sapphire" className="text-lg px-4 py-2">
              <Zap className="w-4 h-4 mr-2" />
              빠른 개발
            </Badge>
            <Badge variant="outline" className="text-lg px-4 py-2">
              <Shield className="w-4 h-4 mr-2" />
              접근성
            </Badge>
            <Badge variant="secondary" className="text-lg px-4 py-2">
              <Rocket className="w-4 h-4 mr-2" />
              현대적
            </Badge>
          </div>
        </div>

        {/* Interactive Tabs */}
        <Tabs defaultValue="buttons" className="mb-12">
          <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-6 mb-8">
            <TabsTrigger value="buttons">버튼</TabsTrigger>
            <TabsTrigger value="forms">폼</TabsTrigger>
            <TabsTrigger value="data">데이터</TabsTrigger>
            <TabsTrigger value="feedback">피드백</TabsTrigger>
            <TabsTrigger value="display">디스플레이</TabsTrigger>
            <TabsTrigger value="layout">레이아웃</TabsTrigger>
          </TabsList>

          <TabsContent value="buttons" className="space-y-6">
            <Card className="border-2 border-blue-100 dark:border-blue-900">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white" style={{backgroundColor: 'hsl(var(--sapphire-600))'}}>
                    <Zap className="w-4 h-4" />
                  </div>
                  Button 컴포넌트 갤러리
                </CardTitle>
                <CardDescription>
                  다양한 스타일과 상태의 버튼들 - 인터랙티브하고 접근 가능한 디자인
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Primary Buttons */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-500" />
                    Primary Buttons
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    <Button variant="sapphire" size="lg" className="gap-2">
                      <Play className="w-4 h-4" />
                      시작하기
                    </Button>
                    <Button variant="sapphire" className="gap-2">
                      <Download className="w-4 h-4" />
                      다운로드
                    </Button>
                    <Button variant="sapphire" size="sm" className="gap-2">
                      <Settings className="w-4 h-4" />
                      설정
                    </Button>
                    <Button variant="sapphire" size="icon">
                      <Heart className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Secondary Buttons */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Secondary & Variants</h3>
                  <div className="flex flex-wrap gap-3">
                    <Button variant="outline" className="gap-2">
                      <Mail className="w-4 h-4" />
                      연락하기
                    </Button>
                    <Button variant="secondary" className="gap-2">
                      <Globe className="w-4 h-4" />
                      더 알아보기
                    </Button>
                    <Button variant="ghost" className="gap-2">
                      <User className="w-4 h-4" />
                      프로필
                    </Button>
                    <Button variant="link">링크 스타일</Button>
                  </div>
                </div>

                {/* Button States */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Button States</h3>
                  <div className="flex flex-wrap gap-3">
                    <Button variant="sapphire" disabled>
                      비활성화됨
                    </Button>
                    <Button variant="destructive">위험한 액션</Button>
                    <Button variant="sapphire" className="animate-pulse">
                      로딩 중...
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="forms" className="space-y-6">
            <Card className="border-2 border-green-100 dark:border-green-900">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white" style={{backgroundColor: 'hsl(var(--sapphire-500))'}}>
                    <Mail className="w-4 h-4" />
                  </div>
                  폼 컴포넌트들
                </CardTitle>
                <CardDescription>
                  사용자 입력을 받는 다양한 폼 요소들
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Input Fields */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Settings className="w-5 h-5 text-blue-500" />
                    Input Fields
                  </h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium block mb-2">이메일 주소</label>
                        <Input type="email" placeholder="your@email.com" />
                      </div>
                      <div>
                        <label className="text-sm font-medium block mb-2">비밀번호</label>
                        <Input type="password" placeholder="••••••••" />
                      </div>
                      <div>
                        <label className="text-sm font-medium block mb-2">검색</label>
                        <Input type="search" placeholder="무엇을 찾고 계신가요?" />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium block mb-2">전화번호</label>
                        <Input type="tel" placeholder="010-0000-0000" />
                      </div>
                      <div>
                        <label className="text-sm font-medium block mb-2">웹사이트</label>
                        <Input type="url" placeholder="https://example.com" />
                      </div>
                      <div>
                        <label className="text-sm font-medium block mb-2">비활성화된 입력</label>
                        <Input disabled placeholder="수정할 수 없습니다" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Select Dropdown */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Select Dropdown</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium block mb-2">국가 선택</label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="국가를 선택하세요" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="kr">🇰🇷 대한민국</SelectItem>
                          <SelectItem value="us">🇺🇸 미국</SelectItem>
                          <SelectItem value="jp">🇯🇵 일본</SelectItem>
                          <SelectItem value="cn">🇨🇳 중국</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium block mb-2">직업 선택</label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="직업을 선택하세요" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="developer">개발자</SelectItem>
                          <SelectItem value="designer">디자이너</SelectItem>
                          <SelectItem value="manager">매니저</SelectItem>
                          <SelectItem value="student">학생</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium block mb-2">경험 수준</label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="수준 선택" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="beginner">초급</SelectItem>
                          <SelectItem value="intermediate">중급</SelectItem>
                          <SelectItem value="advanced">고급</SelectItem>
                          <SelectItem value="expert">전문가</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Checkbox Options */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Checkbox Options</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="newsletter" />
                      <label htmlFor="newsletter" className="text-sm font-medium">
                        뉴스레터 구독
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="notifications" />
                      <label htmlFor="notifications" className="text-sm font-medium">
                        알림 수신
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="marketing" />
                      <label htmlFor="marketing" className="text-sm font-medium">
                        마케팅 정보 수신
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button variant="sapphire" className="flex-1">
                    제출하기
                  </Button>
                  <Button variant="outline" className="flex-1">
                    초기화
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="data" className="space-y-6">
            <Card className="border-2 border-indigo-100 dark:border-indigo-900">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white" style={{backgroundColor: 'hsl(var(--sapphire-700))'}}>
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  데이터 표시 컴포넌트
                </CardTitle>
                <CardDescription>
                  데이터를 구조적으로 표시하는 테이블과 리스트 컴포넌트들
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Data Table */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">사용자 데이터 테이블</h3>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>액션</DropdownMenuLabel>
                        <DropdownMenuItem>
                          <Copy className="mr-2 h-4 w-4" />
                          복사
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          편집
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">
                          <Trash className="mr-2 h-4 w-4" />
                          삭제
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <Table>
                    <TableCaption>최근 등록된 사용자 목록입니다.</TableCaption>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[100px]">ID</TableHead>
                        <TableHead>이름</TableHead>
                        <TableHead>이메일</TableHead>
                        <TableHead>역할</TableHead>
                        <TableHead>상태</TableHead>
                        <TableHead className="text-right">액션</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {[
                        { id: "001", name: "김철수", email: "kim@example.com", role: "개발자", status: "활성" },
                        { id: "002", name: "이영희", email: "lee@example.com", role: "디자이너", status: "활성" },
                        { id: "003", name: "박민수", email: "park@example.com", role: "매니저", status: "비활성" },
                        { id: "004", name: "최지혜", email: "choi@example.com", role: "개발자", status: "활성" },
                        { id: "005", name: "정우진", email: "jung@example.com", role: "분석가", status: "활성" }
                      ].map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.id}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback>{user.name[0]}</AvatarFallback>
                              </Avatar>
                              {user.name}
                            </div>
                          </TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{user.role}</TableCell>
                          <TableCell>
                            <Badge variant={user.status === "활성" ? "sapphire" : "secondary"}>
                              {user.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>보기</DropdownMenuItem>
                                <DropdownMenuItem>편집</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-600">삭제</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="feedback" className="space-y-6">
            <Card className="border-2 border-orange-100 dark:border-orange-900">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white" style={{backgroundColor: 'hsl(var(--sapphire-500))'}}>
                    <Star className="w-4 h-4" />
                  </div>
                  피드백 컴포넌트
                </CardTitle>
                <CardDescription>
                  사용자와 상호작용하는 다이얼로그, 알림 등의 피드백 요소들
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Dialog Examples */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Dialog 모달</h3>
                  <div className="flex gap-4">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="sapphire">기본 다이얼로그</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>확인이 필요합니다</DialogTitle>
                          <DialogDescription>
                            이 작업을 계속하시겠습니까? 변경사항은 되돌릴 수 없습니다.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="flex justify-end gap-2 mt-4">
                          <Button variant="outline">취소</Button>
                          <Button variant="sapphire">확인</Button>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline">설정 다이얼로그</Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>설정</DialogTitle>
                          <DialogDescription>
                            계정 설정을 변경하세요.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 mt-4">
                          <div>
                            <label className="text-sm font-medium block mb-2">이름</label>
                            <Input placeholder="이름을 입력하세요" />
                          </div>
                          <div>
                            <label className="text-sm font-medium block mb-2">이메일</label>
                            <Input type="email" placeholder="email@example.com" />
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox id="notifications-modal" />
                            <label htmlFor="notifications-modal" className="text-sm">
                              알림 받기
                            </label>
                          </div>
                        </div>
                        <div className="flex justify-end gap-2 mt-6">
                          <Button variant="outline">취소</Button>
                          <Button variant="sapphire">저장</Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>

                {/* Dropdown Menu Examples */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Dropdown Menus</h3>
                  <div className="flex gap-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline">
                          메뉴 열기
                          <ChevronDown className="ml-2 h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuLabel>내 계정</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <User className="mr-2 h-4 w-4" />
                          프로필
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Settings className="mr-2 h-4 w-4" />
                          설정
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Mail className="mr-2 h-4 w-4" />
                          메시지
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="sapphire">
                          액션
                          <ChevronDown className="ml-2 h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuLabel>파일 작업</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Download className="mr-2 h-4 w-4" />
                          다운로드
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Copy className="mr-2 h-4 w-4" />
                          복사
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          편집
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">
                          <Trash className="mr-2 h-4 w-4" />
                          삭제
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="display" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Progress & Badges */}
              <Card className="border-2 border-purple-100 dark:border-purple-900">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white" style={{backgroundColor: 'hsl(var(--sapphire-600))'}}>
                      <TrendingUp className="w-4 h-4" />
                    </div>
                    진행률 & 배지
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">프로젝트 진행률</span>
                      <span className="text-sm text-muted-foreground">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-3" />
                    <div className="flex gap-2 mt-4">
                      <Button size="sm" onClick={() => setProgress(Math.max(0, progress - 10))}>
                        -10%
                      </Button>
                      <Button size="sm" onClick={() => setProgress(Math.min(100, progress + 10))}>
                        +10%
                      </Button>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">Status Badges</h4>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="sapphire">활성</Badge>
                      <Badge variant="secondary">대기 중</Badge>
                      <Badge variant="destructive">오류</Badge>
                      <Badge variant="outline">검토 중</Badge>
                      <Badge>기본</Badge>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">Category Badges</h4>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="sapphire">React</Badge>
                      <Badge variant="outline">TypeScript</Badge>
                      <Badge variant="secondary">Tailwind</Badge>
                      <Badge variant="sapphire">Next.js</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Avatars */}
              <Card className="border-2 border-orange-100 dark:border-orange-900">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white" style={{backgroundColor: 'hsl(var(--sapphire-500))'}}>
                      <User className="w-4 h-4" />
                    </div>
                    아바타 & 프로필
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h4 className="font-medium mb-3">Avatar Sizes</h4>
                    <div className="flex items-center gap-4">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">S</AvatarFallback>
                      </Avatar>
                      <Avatar>
                        <AvatarFallback>M</AvatarFallback>
                      </Avatar>
                      <Avatar className="h-12 w-12">
                        <AvatarFallback>L</AvatarFallback>
                      </Avatar>
                      <Avatar className="h-16 w-16">
                        <AvatarFallback className="text-lg">XL</AvatarFallback>
                      </Avatar>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">Team Members</h4>
                    <div className="space-y-3">
                      {[
                        { name: "김철수", role: "Frontend Developer", status: "온라인" },
                        { name: "이영희", role: "UI Designer", status: "부재 중" },
                        { name: "박민수", role: "Backend Developer", status: "온라인" }
                      ].map((member, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback className="text-white" style={{backgroundColor: 'hsl(var(--sapphire-600))'}}>
                              {member.name[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="font-medium">{member.name}</p>
                            <p className="text-sm text-muted-foreground">{member.role}</p>
                          </div>
                          <Badge
                            variant={member.status === "온라인" ? "sapphire" : "secondary"}
                            className="text-xs"
                          >
                            {member.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="layout" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Feature Cards */}
              {[
                {
                  icon: <Rocket className="w-6 h-6" />,
                  title: "빠른 개발",
                  description: "사전 구성된 컴포넌트로 개발 속도를 높이세요",
                  colorVar: "--sapphire-600"
                },
                {
                  icon: <Shield className="w-6 h-6" />,
                  title: "접근성 우선",
                  description: "WCAG 가이드라인을 준수하는 포용적 디자인",
                  colorVar: "--sapphire-500"
                },
                {
                  icon: <Palette className="w-6 h-6" />,
                  title: "커스터마이징",
                  description: "브랜드에 맞게 쉽게 테마를 변경하세요",
                  colorVar: "--sapphire-700"
                }
              ].map((feature, i) => (
                <Card key={i} className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center text-white mb-4" style={{backgroundColor: `hsl(var(${feature.colorVar}))`}}>
                      {feature.icon}
                    </div>
                    <CardTitle>{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" className="w-full group-hover:bg-primary/5">
                      자세히 보기
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Stats Cards */}
            <div className="grid md:grid-cols-4 gap-4 mt-8">
              {[
                { label: "Total Components", value: "12+", icon: <Palette className="w-4 h-4" /> },
                { label: "Theme Colors", value: "11", icon: <Star className="w-4 h-4" /> },
                { label: "Variants", value: "50+", icon: <Zap className="w-4 h-4" /> },
                { label: "Build Size", value: "~102KB", icon: <Rocket className="w-4 h-4" /> }
              ].map((stat, i) => (
                <Card key={i} className="text-center">
                  <CardContent className="pt-6">
                    <div className="flex justify-center mb-2" style={{color: 'hsl(var(--sapphire-600))'}}>
                      {stat.icon}
                    </div>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Color Palette Section */}
        <Card className="mb-12 border-2 border-gradient-to-r from-blue-200 to-purple-200 dark:from-blue-900 dark:to-purple-900">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl flex items-center justify-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-white" style={{backgroundColor: 'hsl(var(--sapphire-600))'}}>
                <Palette className="w-5 h-5" />
              </div>
              Sapphire 컬러 팔레트
            </CardTitle>
            <CardDescription>
              프로젝트 전반에 걸쳐 일관된 시각적 경험을 제공하는 컬러 시스템
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Main Palette */}
              <div>
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full" style={{backgroundColor: 'hsl(var(--sapphire-600))'}} />
                  Primary Sapphire Colors
                </h3>
                <div className="grid grid-cols-5 md:grid-cols-11 gap-2">
                  {Array.from({ length: 11 }, (_, i) => {
                    const scale = i === 0 ? 50 : i === 10 ? 950 : i * 100
                    return (
                      <div key={scale} className="text-center group cursor-pointer">
                        <div
                          className="w-full h-16 rounded-lg border shadow-sm group-hover:shadow-md transition-shadow mb-2"
                          style={{
                            backgroundColor: `hsl(var(--sapphire-${scale}))`
                          }}
                        />
                        <p className="text-xs font-mono">{scale}</p>
                        <p className="text-xs text-muted-foreground">sapphire-{scale}</p>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Usage Examples */}
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'hsl(var(--sapphire-50))' }}>
                  <p className="text-sm font-medium" style={{ color: 'hsl(var(--sapphire-900))' }}>
                    Background Light (50)
                  </p>
                  <p className="text-xs opacity-80">Subtle background areas</p>
                </div>
                <div className="p-4 rounded-lg text-white" style={{ backgroundColor: 'hsl(var(--sapphire-600))' }}>
                  <p className="text-sm font-medium">Primary Color (600)</p>
                  <p className="text-xs opacity-90">Main brand actions</p>
                </div>
                <div className="p-4 rounded-lg text-white" style={{ backgroundColor: 'hsl(var(--sapphire-900))' }}>
                  <p className="text-sm font-medium">Dark Accent (900)</p>
                  <p className="text-xs opacity-90">Text and emphasis</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer CTA */}
        <div className="text-center py-12">
          <h2 className="text-3xl font-bold mb-4">
            지금 바로 시작해보세요!
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            이 컴포넌트들을 사용해서 아름다운 웹 애플리케이션을 빠르게 개발하세요.
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" variant="sapphire" className="gap-2">
              <Download className="w-4 h-4" />
              프로젝트 다운로드
            </Button>
            <Button size="lg" variant="outline" className="gap-2">
              <Globe className="w-4 h-4" />
              문서 보기
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}